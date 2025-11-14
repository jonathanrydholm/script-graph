import { inject, injectable } from 'inversify';
import { ipcMain, dialog } from 'electron';
import {
    CompiledFlowNode,
    compileFlow,
    IdentifiedProjectConfig,
    ProjectFlow,
    ProjectReference,
} from '@script-graph/core';
import {
    IBlueprintService,
    IExecutableNode,
    IIpcHandler,
    IStorage,
} from './types';

@injectable()
export class IpcHandler implements IIpcHandler {
    private isReady = false;

    constructor(
        @inject('IStorage') private storage: IStorage,
        @inject('IBlueprintService') private blueprints: IBlueprintService,
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

        ipcMain.handle('getInstalledNodes', () =>
            this.blueprints
                .getBlueprints()
                .filter((bp) => bp.type !== 'trigger'),
        );

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
                    const { nodes, roots } = compileFlow(
                        flow.nodes,
                        flow.edges,
                    );

                    const nodeMap: Record<string, IExecutableNode | null> =
                        Object.entries(nodes).reduce(
                            (acc, [nodeId, node]) => ({
                                ...acc,
                                [nodeId]:
                                    this.blueprints.getExecutableNode(node),
                            }),
                            {},
                        );

                    const recursivelyJoin = (parent: CompiledFlowNode) => {
                        parent.children.forEach((child) => {
                            nodeMap[parent.id].addChild(
                                nodeMap[child.node.id],
                                child.connections,
                            );
                            recursivelyJoin(child.node);
                        });
                    };

                    roots.forEach(recursivelyJoin);

                    const nonTriggers = roots.filter(
                        (root) => nodeMap[root.id].getNode().type !== 'trigger',
                    );
                    const triggers = roots.filter(
                        (root) => nodeMap[root.id].getNode().type === 'trigger',
                    );

                    try {
                        for (const root of nonTriggers) {
                            await nodeMap[root.id].run([]);
                        }

                        for (const root of triggers) {
                            await nodeMap[root.id].run([]);
                        }
                    } catch (e) {
                        console.error('Yoo', e);
                    }
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
