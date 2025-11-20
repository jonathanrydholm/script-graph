import {
    ProjectConfig,
    ProjectFlow,
    SGEdge,
} from '@script_graph/general-types';
import { ResolvedIO, SerializedSGNode } from '@script_graph/plugin-types';
import { BrowserWindow } from 'electron';

export interface IIpcHandler {
    init(): void;
    setReady(): void;
}

export interface IElectronApp {
    init(): Promise<void>;
    getMainWindow(): BrowserWindow;
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

export interface IConfiguration {
    /** Gives the current environment */
    environment(): 'dev' | 'prod';

    /** Returns the path to the plugin directory */
    pluginDirectoryPath(): string;

    /** Returns the path to the package.json in the plugin directory */
    pluginPackageJsonPath(): string;
}

export type ProjectReference = {
    path: string;
};

export type CentralConfig = {
    projects: ProjectReference[];
};

export interface ICentralConfigService {
    init(): Promise<void>;
    onCentralConfigChanged(
        listener: (config: CentralConfig | null) => void,
    ): void;
    addProject(project: ProjectConfig): Promise<void>;
    removeProject(project: ProjectConfig): Promise<void>;
}

export interface IProjectService {
    init(): void;
    getProjects(): ProjectConfig[];
    updateProject(project: ProjectConfig): Promise<void>;
    createProject(project: ProjectConfig): Promise<void>;
    deleteProject(project: ProjectConfig): Promise<void>;
    getFlow(projectId: string, flowId: string): ProjectFlow | null;
}
