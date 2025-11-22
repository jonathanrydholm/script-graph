import { inject, injectable } from 'inversify';
import { ipcMain, dialog } from 'electron';

import { IElectronApp, IIpcHandler, IProjectService } from './types';
import { FlowRuntime } from '@script_graph/flow-runtime';
import { PluginInstaller } from '@script_graph/plugin-installer';
import {
    ProjectConfig,
    ProjectFlow,
    SerializedPlugin,
    TimestampedNodeLog,
} from '@script_graph/general-types';
import {
    NodeConfigStringField,
    SerializedSGNode,
    SGNode,
} from '@script_graph/plugin-types';

@injectable()
export class IpcHandler implements IIpcHandler {
    private isReady = false;

    constructor(
        @inject('FlowRuntime') private flowRuntime: FlowRuntime,
        @inject('PluginInstaller') private pluginInstaller: PluginInstaller,
        @inject('IElectronApp') private app: IElectronApp,
        @inject('IProjectService') private projectService: IProjectService,
    ) {}

    setReady(): void {
        this.isReady = true;
    }

    init(): void {
        ipcMain.handle('waitUntilReady', async () => {
            if (this.isReady) {
                return;
            } else {
                await new Promise<void>((resolve) => {
                    const id = setInterval(() => {
                        if (this.isReady) {
                            resolve();
                            clearInterval(id);
                        }
                    }, 200);
                });
            }
        });

        ipcMain.handle('updateProject', (_, config: ProjectConfig) =>
            this.projectService.updateProject(config),
        );

        ipcMain.handle('getProjects', () =>
            Promise.resolve(this.projectService.getProjects()),
        );

        ipcMain.handle('createProject', (_, project: ProjectConfig) =>
            this.projectService.createProject(project),
        );

        ipcMain.handle('deleteProject', (_, project: ProjectConfig) =>
            this.projectService.deleteProject(project),
        );

        ipcMain.handle('getRegisteredPlugins', async () => {
            return this.pluginInstaller
                .getRegisteredPlugins()
                .map((plugin) => ({
                    ...plugin,
                    nodes: plugin.nodes.map((node) => ({
                        config: node.config,
                        inputs: node.inputs,
                        name: node.name,
                        outputs: node.outputs,
                        tags: node.tags,
                        type: node.type,
                    })) as Omit<SGNode, 'execute'>[],
                })) as SerializedPlugin[];
        });

        ipcMain.handle(
            'getFlow',
            async (_, projectId: string, flowId: string) => {
                return this.projectService.getFlow(projectId, flowId);
            },
        );

        ipcMain.handle(
            'executeFlow',
            async (_, projectId: string, flowId: string) => {
                const flow = this.projectService.getFlow(projectId, flowId);
                if (flow) {
                    const recursivelyFetchTemplateNodes = (
                        processFlow: ProjectFlow,
                    ): ProjectFlow[] => {
                        const templateFlows = processFlow.nodes
                            .filter((n) => n.type === 'Template')
                            .map((template) => {
                                const templateFlowId = (
                                    template.config.fields.find(
                                        (field) =>
                                            field.type === 'string' &&
                                            field.field === 'flowId',
                                    ) as NodeConfigStringField
                                )?.value;
                                const templateProjectId = (
                                    template.config.fields.find(
                                        (field) =>
                                            field.type === 'string' &&
                                            field.field === 'projectId',
                                    ) as NodeConfigStringField
                                )?.value;
                                if (templateFlowId && templateProjectId) {
                                    return this.projectService.getFlow(
                                        templateProjectId,
                                        templateFlowId,
                                    );
                                }
                            })
                            .filter((f) => f);

                        return [
                            ...templateFlows,
                            ...templateFlows.flatMap(
                                recursivelyFetchTemplateNodes,
                            ),
                        ];
                    };

                    const templateFlows = recursivelyFetchTemplateNodes(flow);

                    await this.flowRuntime.ExecuteFlow(
                        [
                            ...flow.nodes,
                            ...templateFlows.flatMap((f) => f.nodes),
                        ],
                        [
                            ...flow.edges,
                            ...templateFlows.flatMap((f) => f.edges),
                        ],
                        (log) => {
                            this.app.getMainWindow().webContents.send(
                                'node-log',
                                JSON.stringify({
                                    ...log,
                                    timestamp: new Date().getTime(),
                                } as TimestampedNodeLog),
                            );
                        },
                        (nodeStatus) => {
                            this.app
                                .getMainWindow()
                                .webContents.send(
                                    'node-status',
                                    JSON.stringify(nodeStatus),
                                );
                        },
                    );
                }
            },
        );

        ipcMain.handle('select-folder', async () => {
            const result = await dialog.showOpenDialog({
                properties: ['openDirectory'],
            });

            if (result.canceled) {
                return null;
            } else {
                return result.filePaths[0];
            }
        });
    }
}
