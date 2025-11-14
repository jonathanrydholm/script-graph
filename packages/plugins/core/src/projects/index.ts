import { SerializedSGNode, SGEdge } from "types"

export type ProjectReference = {
    name: string
    path: string
    global?: boolean;
}

export type CentralConfig = {
    projects: ProjectReference[]
}

export type ProjectConfig = {
    flows: ProjectFlow[]
}

export type IdentifiedProjectConfig = ProjectConfig & { path: string };

export type ProjectFlow = {
    id: string
    name: string
    nodes: SerializedSGNode[]
    edges: SGEdge[]
}