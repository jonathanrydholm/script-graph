import {
    ExecutorFn,
    NodeBlueprint,
    NodeStatus,
    ResolvedIO,
    SerializedSGNode,
    SGEdge,
    SGNode,
    SGNodeToBlueprint,
    TimestampedLog,
    Plugin,
} from '@script_graph/core';
import { inject, injectable } from 'inversify';
import { IBlueprintService, IElectronApp, IExecutableNode } from './types';
import { join } from 'path';
import { app } from 'electron';
import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { Module } from 'module';
import { exec } from 'child_process';
import { CopyResources, Sleep, Trigger } from '../Nodes';

@injectable()
export class BlueprintService implements IBlueprintService {
    constructor(@inject('IElectronApp') private app: IElectronApp) {}

    private nodes: SGNode[] = [Trigger, CopyResources, Sleep];

    private nodeMap: Record<string, SGNode> = {};

    async loadPlugins() {
        console.log('Initializing plugin directory');
        const { pluginDirectory, dependencies } =
            await this.initializePluginPackageJson();

        console.log('Installing plugins');
        await new Promise<void>((resolve, reject) => {
            exec(`npm install --prefix "${pluginDirectory}"`, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        const requireFromPlugins = Module.createRequire(
            join(pluginDirectory, 'node_modules'),
        );

        const plugins = Object.keys(dependencies)
            .filter(
                (dep) =>
                    /** Make sure to not include the core package since it is always loaded as part of the build. */
                    dep !== '@script_graph/core' &&
                    dep.startsWith('@script_graph/'),
            )
            .map((dep) => {
                console.log(`Registered plugin ${dep}`);
                return requireFromPlugins(dep).default;
            }) as Plugin[];

        plugins.forEach((plugin) => {
            this.nodes.push(...plugin.nodes);
        });

        this.nodeMap = this.nodes.reduce(
            (acc, curr) => ({ ...acc, [curr.type]: curr }),
            {},
        );
    }

    private async initializePluginPackageJson() {
        const pluginDirectory = join(app.getPath('userData'), 'plugins');

        if (!existsSync(pluginDirectory)) {
            await mkdir(pluginDirectory, { recursive: true });
        }

        const packageJsonPath = join(pluginDirectory, 'package.json');

        let dependencies: Record<string, string> = {};

        if (!existsSync(packageJsonPath)) {
            await writeFile(
                packageJsonPath,
                JSON.stringify({
                    name: 'script_graph-plugins',
                    version: '1.0.0',
                    dependencies,
                }),
                'utf8',
            );
        } else {
            const raw = await readFile(packageJsonPath, 'utf8');
            dependencies = JSON.parse(raw).dependencies;
        }

        return {
            pluginDirectory,
            packageJsonPath,
            dependencies,
        };
    }

    getSGNode(type: string): SGNode | null {
        return this.nodeMap[type] || null;
    }

    getBlueprints(): NodeBlueprint[] {
        return this.nodes.map(SGNodeToBlueprint);
    }

    getExecutableNode(
        serializedNode: SerializedSGNode,
    ): IExecutableNode | null {
        const sgNode = this.getSGNode(serializedNode.type);
        if (sgNode) {
            return new ExecutableNode(sgNode.execute, serializedNode, this.app);
        }
        return null;
    }
}

export class ExecutableNode implements IExecutableNode {
    protected children: { node: IExecutableNode; connections: SGEdge[] }[] = [];

    protected parents: {
        node: IExecutableNode;
        connections: SGEdge[];
        value: ResolvedIO[] | undefined;
    }[] = [];

    public results: ResolvedIO[] = [];

    constructor(
        private executor: ExecutorFn,
        private serializedNode: SerializedSGNode,
        private app: IElectronApp,
    ) {}

    async run(inputs: ResolvedIO[]) {
        try {
            const outputs = await this.executor(
                inputs,
                this.serializedNode.config,
                {
                    serializedNode: this.serializedNode,
                    streamLog: (log) => {
                        this.app.getMainWindow().webContents.send(
                            'node-log',
                            JSON.stringify({
                                ...log,
                                timestamp: new Date().getTime(),
                            } as TimestampedLog),
                        );
                    },
                },
            );
            this.app.getMainWindow().webContents.send(
                'node-status',
                JSON.stringify({
                    success: true,
                    nodeId: this.serializedNode.id,
                } as NodeStatus),
            );
            await this.callChildren(outputs);
        } catch (e) {
            this.app.getMainWindow().webContents.send(
                'node-status',
                JSON.stringify({
                    success: false,
                    nodeId: this.serializedNode.id,
                } as NodeStatus),
            );
            throw e;
        }
    }

    getNode(): SerializedSGNode {
        return this.serializedNode;
    }

    addChild = (child: IExecutableNode, connections: SGEdge[]) => {
        if (
            !this.children.some(
                (p) => p.node.getNode().id === child.getNode().id,
            )
        ) {
            this.children.push({ connections, node: child });
            child.addParent(this, connections);
        }
    };

    addParent = (parent: IExecutableNode, connections: SGEdge[]) => {
        if (
            !this.parents.some(
                (p) => p.node.getNode().id === parent.getNode().id,
            )
        ) {
            this.parents.push({ connections, node: parent, value: undefined });
        }
    };

    /** All children of this node gets called with all of my output values.  */
    callChildren = async (outputValue: ResolvedIO[]) => {
        this.results = outputValue;
        await Promise.all(
            this.children.map((child) =>
                child.node.onParentCalling(this, outputValue),
            ),
        );
    };

    onParentCalling = async (parent: IExecutableNode, value: ResolvedIO[]) => {
        const existing = this.parents.find(
            (p) => p.node.getNode().id === parent.getNode().id,
        );
        if (existing) {
            existing.value = value;
        }

        /** If any parents are not resolved yet */
        if (this.parents.some((p) => p.value === undefined)) {
            return;
        } else {
            await this.run(this.collectParentResults());
        }
    };

    /** Map parent connection to correct inputs */
    collectParentResults = (): ResolvedIO[] => {
        const parentOutputs: ResolvedIO[] = [];

        this.parents.forEach(({ connections, value }) => {
            connections.forEach(({ targetHandle, sourceHandle }) => {
                parentOutputs[parseInt(targetHandle)] =
                    value[parseInt(sourceHandle)];
            });
        });

        return parentOutputs;
    };
}
