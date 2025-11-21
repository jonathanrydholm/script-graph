import { NodeStatus, SGEdge } from '@script_graph/general-types';
import { ExecuteFnIO, SerializedSGNode } from '@script_graph/plugin-types';

export interface CompiledFlowNode {
    id: string;
    children: { node: CompiledFlowNode; connections: SGEdge[] }[];
}

export interface CompiledFlow {
    roots: CompiledFlowNode[];
    serializedNodeMap: Record<string, SerializedSGNode>;
}

export interface IExecutableNode {
    run(inputs: ExecuteFnIO): Promise<void>;
    getNode(): SerializedSGNode;
    addChild(child: IExecutableNode, connections: SGEdge[]): void;
    addParent(parent: IExecutableNode, connections: SGEdge[]): void;
    collectParentResults(): ExecuteFnIO;
    onParentCalling(parent: IExecutableNode, value: ExecuteFnIO): Promise<void>;
}

export type StreamNodeStatusFn = (status: NodeStatus) => void;
