import { SerializedSGNode } from '@script_graph/plugin-types';
import { SGEdge } from './SGEdge';

export type ProjectFlowType = 'executable' | 'template';

export type ProjectFlow = {
    id: string;
    name: string;
    nodes: SerializedSGNode[];
    edges: SGEdge[];
    type: ProjectFlowType;
};

export type ProjectConfig = {
    id: string;
    name: string;
    flows: ProjectFlow[];
    path: string;
};
