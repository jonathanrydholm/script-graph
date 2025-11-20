import { ProjectConfig, ProjectFlow } from '@script_graph/general-types';
import { ChildLogger, ILogger } from '@script_graph/logger';
import { FSWatcher, watch } from 'chokidar';
import { readFile, rm, writeFile } from 'fs/promises';
import { inject, injectable } from 'inversify';
import {
    CentralConfig,
    ICentralConfigService,
    IElectronApp,
    IProjectService,
} from './types';
import { dirname, join } from 'path';

@injectable()
export class ProjectService implements IProjectService {
    private logger: ChildLogger;

    private projects: ProjectConfig[] = [];

    private watcher: FSWatcher | null = null;

    constructor(
        @inject('IElectronApp') private electronApp: IElectronApp,
        @inject('ICentralConfigService')
        private centralConfigService: ICentralConfigService,
        @inject('ILogger') logger: ILogger,
    ) {
        this.logger = logger.getLogger('ProjectService');
        this.centralConfigService.onCentralConfigChanged((centralConfig) =>
            this.onCentralConfigChanged(centralConfig),
        );
    }

    init(): void {
        this.watcher = watch([], {
            persistent: true,
            ignoreInitial: false,
            depth: 0,
        });

        this.watcher
            .on('add', async (path) => {
                try {
                    this.logger.info(`${path} has been added`);
                    const contents = await readFile(path, 'utf8');
                    const projectConfig: Omit<ProjectConfig, 'path'> =
                        JSON.parse(contents);
                    this.projects.push({
                        ...projectConfig,
                        path: dirname(path),
                    });
                } catch (e) {
                    this.logger.error(e, 'Could not read project');
                } finally {
                    this.throttleProjectUpdates();
                }
            })
            .on('change', async (path) => {
                try {
                    const contents = await readFile(path, 'utf8');
                    const projectConfig: Omit<ProjectConfig, 'path'> =
                        JSON.parse(contents);
                    this.projects = this.projects.map((project) =>
                        project.id === projectConfig.id
                            ? {
                                  ...projectConfig,
                                  path: dirname(path),
                              }
                            : project,
                    );
                } catch (e) {
                    this.logger.error(e, 'Could not read project');
                } finally {
                    this.throttleProjectUpdates();
                }
            })
            .on('unlink', async (path) => {
                try {
                    this.projects = this.projects.filter(
                        (project) => project.path !== dirname(path),
                    );
                    this.watcher.unwatch(path);
                } catch (e) {
                    this.logger.error(e, 'Could not close watcher');
                } finally {
                    this.throttleProjectUpdates();
                }
            })
            .on('error', (err) => this.logger.error(err, `Error watching`));
    }

    private pathToScriptGraphFile(path: string) {
        return join(path, 'script_graph.json');
    }

    getFlow(projectId: string, flowId: string): ProjectFlow | null {
        return (
            this.projects
                .find((p) => p.id === projectId)
                ?.flows.find((f) => f.id === flowId) || null
        );
    }

    async updateProject(project: ProjectConfig): Promise<void> {
        await writeFile(
            this.pathToScriptGraphFile(project.path),
            JSON.stringify(
                { flows: project.flows, id: project.id, name: project.name },
                null,
                4,
            ),
            'utf8',
        );
    }

    async createProject(project: ProjectConfig): Promise<void> {
        await this.centralConfigService.addProject(project);
        await writeFile(
            this.pathToScriptGraphFile(project.path),
            JSON.stringify(
                { flows: project.flows, id: project.id, name: project.name },
                null,
                4,
            ),
            'utf8',
        );
    }

    async deleteProject(project: ProjectConfig): Promise<void> {
        await this.centralConfigService.removeProject(project);
        await rm(this.pathToScriptGraphFile(project.path), { force: true });
    }

    getProjects(): ProjectConfig[] {
        return this.projects;
    }

    private async onCentralConfigChanged(centralConfig: CentralConfig | null) {
        this.logger.info(
            'Detected a central configuration change. Processing...',
        );

        if (centralConfig === null) {
            this.projects = [];
            return;
        }

        this.watcher.add(
            centralConfig.projects.map((project) =>
                this.pathToScriptGraphFile(project.path),
            ),
        );
    }

    private timeoutId: NodeJS.Timeout | null;

    private throttleProjectUpdates() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = setTimeout(() => {
            this.logger.info(
                `Sending (${this.projects.length}) projects to renderer`,
            );
            this.timeoutId = null;
            this.electronApp
                .getMainWindow()
                .webContents.send(
                    'projectsUpdated',
                    JSON.stringify(this.projects),
                );
        }, 500);
    }
}
