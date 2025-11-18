import { inject, injectable } from 'inversify';
import { ipcMain, dialog } from 'electron';
import {
    IdentifiedProjectConfig,
    ProjectFlow,
    ProjectReference,
    SGNode,
} from '@script_graph/core';
import { IElectronApp, IIpcHandler, IStorage } from './types';
import { FlowRuntime } from '@script_graph/flow-runtime';
import { PluginInstaller } from '@script_graph/plugin-installer';
import {
    SerializedPlugin,
    TimestampedNodeLog,
} from '@script_graph/general-types';

@injectable()
export class IpcHandler implements IIpcHandler {
    private isReady = false;

    constructor(
        @inject('IStorage') private storage: IStorage,
        @inject('FlowRuntime') private flowRuntime: FlowRuntime,
        @inject('PluginInstaller') private pluginInstaller: PluginInstaller,
        @inject('IElectronApp') private app: IElectronApp,
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

        ipcMain.handle('updateProject', (_, config: IdentifiedProjectConfig) =>
            this.storage.updateProject(config),
        );
        ipcMain.handle('getProjectReferences', () =>
            this.storage.getProjectReferences(),
        );
        ipcMain.handle('getProject', (_, path: string) =>
            this.storage.getProject(path),
        );
        ipcMain.handle('createProject', (_, project: ProjectReference) =>
            this.storage.createProject(project),
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

        ipcMain.handle('getFlow', (_, projectPath: string, flowId: string) =>
            this.storage.getFlow(projectPath, flowId),
        );

        ipcMain.handle(
            'updateFlow',
            (_, projectPath: string, config: ProjectFlow) =>
                this.storage.updateFlow(projectPath, config),
        );

        ipcMain.handle(
            'runManualFlow',
            async (_, projectPath: string, id: string) => {
                const flow =
                    (await this.storage.getFlow(projectPath, id)) || null;

                if (flow) {
                    await this.flowRuntime.ExecuteFlow(
                        flow.nodes,
                        flow.edges,
                        (log) => {
                            this.app
                                .getMainWindow()
                                .webContents.send(
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
