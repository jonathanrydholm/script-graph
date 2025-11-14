import { CompiledFlow, CompiledFlowNode, SerializedSGNode, SGEdge } from "../types";

export const compileFlow = (nodes: SerializedSGNode[], edges: SGEdge[]): CompiledFlow => {
    const nodeMap: Record<string, SerializedSGNode> = {};

    const roots = nodes.filter((node) => !edges.some((edge) => edge.target === node.id));

    const build = (parent: SerializedSGNode): CompiledFlowNode => {
        if (!nodeMap[parent.id]) {
            nodeMap[parent.id] = parent;
        }

        const childConnections = edges.filter((edge) => edge.source === parent.id);

        const childNodes = nodes.filter((node) =>
            childConnections.some((conn) => conn.target === node.id)
        );

        return {
            id: parent.id,
            children: childNodes.map((node) => {
                return {
                    node: build(node),
                    connections: childConnections.filter((conn) => conn.target === node.id),
                };
            }),
        }
    };

    return {
        nodes: nodeMap,
        roots: roots.map(build),
    };
};