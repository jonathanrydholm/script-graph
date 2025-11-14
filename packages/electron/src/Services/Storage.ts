import { injectable } from 'inversify';
import { join } from 'path';
import { app } from 'electron';
import {
    CentralConfig,
    IdentifiedProjectConfig,
    ProjectFlow,
    ProjectReference,
} from '@script_graph/core';
import { IStorage } from './types';
import { readFile, writeFile } from 'fs/promises';

@injectable()
export class Storage implements IStorage {
    private centralConfigLocation: string;

    private store: CentralConfig;

    private projects: Record<string, IdentifiedProjectConfig> = {};

    init(): void {
        this.centralConfigLocation = join(
            app.getPath('userData'),
            'script_graph_central.json',
        );
        console.log('Central config located at: ', this.centralConfigLocation);
    }

    async createProject(project: ProjectReference): Promise<ProjectReference> {
        this.store.projects.push({
            ...project,
            path: join(project.path, 'script_graph.json'),
        });

        await writeFile(
            join(project.path, 'script_graph.json'),
            JSON.stringify(
                {
                    flows: [],
                },
                null,
                2,
            ),
            'utf8',
        );

        await writeFile(
            this.centralConfigLocation,
            JSON.stringify(this.store, null, 2),
            'utf8',
        );

        await this.loadStore();

        return project;
    }

    async updateFlow(
        projectPath: string,
        config: ProjectFlow,
    ): Promise<ProjectFlow> {
        if (!this.projects[projectPath]) {
            throw new Error('Could not find project: ' + projectPath);
        }
        this.projects[projectPath].flows = this.projects[projectPath].flows.map(
            (flow) => (flow.id === config.id ? config : flow),
        );

        await this.saveProjectConfig(projectPath);

        return config;
    }

    async getFlow(projectPath: string, flowId: string): Promise<ProjectFlow> {
        return this.projects[projectPath].flows.find(
            (flow) => flow.id === flowId,
        );
    }

    async getProject(id: string): Promise<IdentifiedProjectConfig> {
        return this.projects[id];
    }

    async getProjectReferences(): Promise<ProjectReference[]> {
        return this.store.projects;
    }

    async updateProject(
        config: IdentifiedProjectConfig,
    ): Promise<IdentifiedProjectConfig> {
        if (this.projects[config.path]) {
            this.projects[config.path] = {
                ...this.projects[config.path],
                ...config,
            };
            await this.saveProjectConfig(config.path);
        }
        return config;
    }

    async loadStore(): Promise<void> {
        try {
            const contents = await readFile(this.centralConfigLocation, 'utf8');
            this.store = JSON.parse(contents);
        } catch {
            this.store = {
                projects: [],
            };
            await writeFile(
                this.centralConfigLocation,
                JSON.stringify(this.store, null, 2),
                'utf8',
            );
        }

        const stringifiedConfigs = await Promise.all(
            this.store.projects.map(async (project) => {
                try {
                    const contents = await readFile(project.path, 'utf8');

                    console.log('Found project on', project.path);

                    return {
                        path: project.path,
                        contents,
                    };
                } catch (e) {
                    console.error('Could not find project at', project.path, e);
                    return null;
                }
            }),
        );

        const projects = stringifiedConfigs
            .filter((c) => c !== null)
            .map(({ contents, path }) => ({
                ...JSON.parse(contents),
                path,
            })) as IdentifiedProjectConfig[];

        this.projects = projects.reduce(
            (acc, curr) => ({ ...acc, [curr.path]: curr }),
            {},
        );
    }

    async saveStore(config: CentralConfig): Promise<void> {
        // await writeFile(this.storageLocation, JSON.stringify(config));
        this.store = config;
    }

    getStore(): CentralConfig {
        return this.store;
    }

    private async saveProjectConfig(path: string): Promise<void> {
        await writeFile(
            this.projects[path].path,
            JSON.stringify(
                {
                    flows: this.projects[path].flows,
                },
                null,
                2,
            ),
            'utf8',
        );
    }
}
