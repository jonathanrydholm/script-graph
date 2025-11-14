import {
    CentralConfig,
    IdentifiedProjectConfig,
    NodeBlueprint,
    ProjectFlow,
    ProjectReference,
    ResolvedIO,
    SerializedSGNode,
    SGEdge,
    SGNode,
} from '@script_graph/core';
import { BrowserWindow } from 'electron';

export interface IStorage {
    init(): void;
    loadStore(): Promise<void>;
    saveStore(config: CentralConfig): Promise<void>;
    /** Get the stored config */
    getStore(): CentralConfig;

    createProject(project: ProjectReference): Promise<ProjectReference>;
    updateProject(
        config: IdentifiedProjectConfig,
    ): Promise<IdentifiedProjectConfig>;
    updateFlow(projectPath: string, config: ProjectFlow): Promise<ProjectFlow>;

    getProjectReferences(): Promise<ProjectReference[]>;
    getProject(id: string): Promise<IdentifiedProjectConfig>;
    getFlow(projectId: string, flowId: string): Promise<ProjectFlow>;
}

export interface IIpcHandler {
    init(): void;
    setReady(): void;
}

export interface IElectronApp {
    init(): Promise<void>;
    getMainWindow(): BrowserWindow;
}

export interface IBlueprintService {
    loadPlugins(): Promise<void>;
    getSGNode(type: string): SGNode | null;
    getExecutableNode(serializedNode: SerializedSGNode): IExecutableNode | null;
    getBlueprints(): NodeBlueprint[];
}

export interface IExecutableNode {
    run(inputs: ResolvedIO[]): Promise<void>;
    getNode(): SerializedSGNode;
    addChild(child: IExecutableNode, connections: SGEdge[]): void;
    addParent(parent: IExecutableNode, connections: SGEdge[]): void;
    collectParentResults(): ResolvedIO[];
    onParentCalling(
        parent: IExecutableNode,
        value: ResolvedIO[],
    ): Promise<void>;
}
