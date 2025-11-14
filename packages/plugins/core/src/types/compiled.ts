import { SGEdge } from "./edge";
import { SerializedSGNode } from "./node";

export interface CompiledFlowNode {
    id: string;
    children: { node: CompiledFlowNode; connections: SGEdge[] }[];
}

export interface CompiledFlow {
    roots: CompiledFlowNode[];
    nodes: Record<string, SerializedSGNode>;
}