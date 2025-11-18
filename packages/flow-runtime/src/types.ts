import { NodeStatus, SGEdge } from '@script_graph/general-types';
import { ResolvedIO, SerializedSGNode } from '@script_graph/plugin-types';

export interface CompiledFlowNode {
    id: string;
    children: { node: CompiledFlowNode; connections: SGEdge[] }[];
}

export interface CompiledFlow {
    roots: CompiledFlowNode[];
    serializedNodeMap: Record<string, SerializedSGNode>;
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

export type StreamNodeStatusFn = (status: NodeStatus) => void;
