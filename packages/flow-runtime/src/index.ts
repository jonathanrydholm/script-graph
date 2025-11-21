import { SGEdge } from '@script_graph/general-types';
import {
    SerializedSGNode,
    SGNode,
    StreamLogFn,
} from '@script_graph/plugin-types';
import { injectable } from 'inversify';
import {
    CompiledFlow,
    CompiledFlowNode,
    IExecutableNode,
    StreamNodeStatusFn,
} from './types';
import { ExecutableNode, LoopExecutable } from './ExecutableNode';

@injectable()
export class FlowRuntime {
    private sgNodeMap: Record<string, SGNode> = {};

    public setSGNodes(nodes: SGNode[]) {
        this.sgNodeMap = {};

        nodes.forEach((node) => (this.sgNodeMap[node.type] = node));
    }

    public async ExecuteFlow(
        nodes: SerializedSGNode[],
        edges: SGEdge[],
        streamLog: StreamLogFn,
        streamNodeStatus: StreamNodeStatusFn,
    ) {
        const { serializedNodeMap, roots } = this.CompileFlow(nodes, edges);

        const executableNodeMap = this.CreateExecutableNodeMap(
            serializedNodeMap,
            streamLog,
            streamNodeStatus,
        );

        const recursivelyJoin = (parent: CompiledFlowNode) => {
            parent.children.forEach((child) => {
                executableNodeMap[parent.id].addChild(
                    executableNodeMap[child.node.id],
                    child.connections,
                );
                recursivelyJoin(child.node);
            });
        };

        roots.forEach(recursivelyJoin);

        const nonTriggers = roots.filter(
            (root) =>
                executableNodeMap[root.id].getNode().type !== 'entrypoint',
        );
        const triggers = roots.filter(
            (root) =>
                executableNodeMap[root.id].getNode().type === 'entrypoint',
        );

        try {
            for (const root of nonTriggers) {
                await executableNodeMap[root.id].run([]);
            }

            for (const root of triggers) {
                await executableNodeMap[root.id].run([]);
            }
        } catch (e) {
            console.error('Execution of nodes failed.', e);
        }
    }

    /** Creates a map of executable nodes for all serialized nodes */
    private CreateExecutableNodeMap(
        nodes: Record<string, SerializedSGNode>,
        streamLog: StreamLogFn,
        streamNodeStatus: StreamNodeStatusFn,
    ): Record<string, IExecutableNode> {
        return Object.entries(nodes).reduce(
            (acc, [nodeId, node]) => ({
                ...acc,
                [nodeId]: this.GetExecutableNode(
                    node,
                    streamLog,
                    streamNodeStatus,
                ),
            }),
            {},
        );
    }

    /** Creates a executable version of a serialized node */
    private GetExecutableNode(
        serializedNode: SerializedSGNode,
        streamLog: StreamLogFn,
        streamNodeStatus: StreamNodeStatusFn,
    ): IExecutableNode {
        const sgNode = this.sgNodeMap[serializedNode.type];
        if (sgNode) {
            if (sgNode.type === 'ForEach') {
                return new LoopExecutable(
                    sgNode.execute,
                    serializedNode,
                    streamLog,
                    streamNodeStatus,
                );
            }
            return new ExecutableNode(
                sgNode.execute,
                serializedNode,
                streamLog,
                streamNodeStatus,
            );
        }
        throw new Error(
            `Could not find executable node with type ${serializedNode.type}`,
        );
    }

    /** Compiles flows into a recursive structure */
    private CompileFlow(
        nodes: SerializedSGNode[],
        edges: SGEdge[],
    ): CompiledFlow {
        const serializedNodeMap: Record<string, SerializedSGNode> = {};

        const roots = nodes.filter(
            (node) => !edges.some((edge) => edge.target === node.id),
        );

        const build = (parent: SerializedSGNode): CompiledFlowNode => {
            if (!serializedNodeMap[parent.id]) {
                serializedNodeMap[parent.id] = parent;
            }

            const childConnections = edges.filter(
                (edge) => edge.source === parent.id,
            );

            const childNodes = nodes.filter((node) =>
                childConnections.some((conn) => conn.target === node.id),
            );

            return {
                id: parent.id,
                children: childNodes.map((node) => {
                    return {
                        node: build(node),
                        connections: childConnections.filter(
                            (conn) => conn.target === node.id,
                        ),
                    };
                }),
            };
        };

        return {
            serializedNodeMap: serializedNodeMap,
            roots: roots.map(build),
        };
    }
}
