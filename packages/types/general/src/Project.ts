import { SerializedSGNode } from '@script_graph/plugin-types';
import { SGEdge } from './SGEdge';

export type ProjectFlow = {
    id: string;
    name: string;
    nodes: SerializedSGNode[];
    metaNodes: MetaNode[];
    edges: SGEdge[];
};

export type MetaNode = Pick<
    SerializedSGNode,
    'graphics' | 'id' | 'type' | 'name' | 'tags'
>;

export type ProjectConfig = {
    id: string;
    name: string;
    flows: ProjectFlow[];
    path: string;
};
