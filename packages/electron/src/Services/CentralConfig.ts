import { ChildLogger, ILogger } from '@script_graph/logger';
import { watch } from 'chokidar';
import { app } from 'electron';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { inject, injectable } from 'inversify';
import { join } from 'path';
import { CentralConfig, ICentralConfigService } from './types';
import { ProjectConfig } from '@script_graph/general-types';

@injectable()
export class CentralConfigService implements ICentralConfigService {
    private centralConfig: CentralConfig | null = null;

    private logger: ChildLogger;

    constructor(@inject('ILogger') logger: ILogger) {
        this.logger = logger.getLogger('CentralConfigService');
    }

    async addProject(project: ProjectConfig): Promise<void> {
        if (!this.centralConfig) {
            throw new Error(
                `Cannot add project to non-existing central config.`,
            );
        }

        this.centralConfig.projects.push({
            path: project.path,
        });

        await writeFile(
            this.getCentralConfigLocation(),
            JSON.stringify(this.centralConfig),
            'utf-8',
        );
    }

    async removeProject(project: ProjectConfig): Promise<void> {
        if (!this.centralConfig) {
            throw new Error(
                `Cannot remove project from non-existing central config.`,
            );
        }
        this.logger.info('Removing project: ' + project.path);
        this.centralConfig.projects = this.centralConfig.projects.filter(
            (p) => p.path !== project.path,
        );

        await writeFile(
            this.getCentralConfigLocation(),
            JSON.stringify(this.centralConfig),
            'utf-8',
        );
    }

    async init(): Promise<void> {
        this.logger.info('Watching: ' + this.getCentralConfigLocation());
        const watcher = watch(this.getCentralConfigLocation(), {
            persistent: true,
            ignoreInitial: false,
            depth: 0,
        });

        watcher
            .on('add', async () => {
                await this.loadCentralConfig();
                this.notifyListeners();
            })
            .on('change', async () => {
                await this.loadCentralConfig();
                this.notifyListeners();
            })
            .on('unlink', () => {
                this.centralConfig = null;
                this.notifyListeners();
            })
            .on('error', (err) => console.error('Watcher error:', err));

        if (!existsSync(this.getCentralConfigLocation())) {
            this.logger.info('Central config could not be found. Creating...');
            this.centralConfig = {
                projects: [],
            };

            try {
                this.logger.info('Writing central config to disk');
                await writeFile(
                    this.getCentralConfigLocation(),
                    JSON.stringify(this.centralConfig),
                    'utf-8',
                );
                this.logger.info('Central config written succesfully');
            } catch (e) {
                this.logger.error(e, 'Could not write central config to disk');
                this.centralConfig = null;
                return;
            }
        }
    }

    private async loadCentralConfig() {
        this.logger.info('Loading central config');

        try {
            this.logger.info('Loading central config from disk');
            const contents = await readFile(
                this.getCentralConfigLocation(),
                'utf8',
            );
            // TODO. Add zod validation on format
            this.centralConfig = JSON.parse(contents);
            this.logger.info('Central config loaded');
        } catch (e) {
            this.logger.error(e, 'Could not write central config to disk');
            this.centralConfig = null;
            return;
        }
    }

    private changeListeners: ((config: CentralConfig | null) => void)[] = [];

    onCentralConfigChanged(listener: (config: CentralConfig | null) => void) {
        this.changeListeners.push(listener);
    }

    private notifyListeners() {
        this.changeListeners.forEach((l) => l(this.centralConfig));
    }

    getCentralConfigLocation() {
        return join(app.getPath('userData'), 'script_graph_central.json');
    }
}
