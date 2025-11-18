import { SGEdge } from '@script_graph/general-types';
import {
    ExecutorFn,
    ResolvedIO,
    SerializedSGNode,
    StreamLogFn,
} from '@script_graph/plugin-types';
import { IExecutableNode, StreamNodeStatusFn } from 'types';

export class ExecutableNode implements IExecutableNode {
    protected children: { node: IExecutableNode; connections: SGEdge[] }[] = [];

    protected parents: {
        node: IExecutableNode;
        connections: SGEdge[];
        value: ResolvedIO[] | undefined;
    }[] = [];

    public results: ResolvedIO[] = [];

    constructor(
        private executor: ExecutorFn,
        private serializedNode: SerializedSGNode,
        private streamLog: StreamLogFn,
        private streamNodeStatus: StreamNodeStatusFn,
    ) {}

    async run(inputs: ResolvedIO[]) {
        try {
            const outputs = await this.executor(
                inputs,
                this.serializedNode.config,
                {
                    serializedNode: this.serializedNode,
                    streamLog: this.streamLog,
                },
            );
            this.streamNodeStatus({
                success: true,
                nodeId: this.serializedNode.id,
            });
            await this.callChildren(outputs);
        } catch (e) {
            this.streamNodeStatus({
                success: false,
                nodeId: this.serializedNode.id,
            });
            throw e;
        }
    }

    getNode(): SerializedSGNode {
        return this.serializedNode;
    }

    addChild = (child: IExecutableNode, connections: SGEdge[]) => {
        if (
            !this.children.some(
                (p) => p.node.getNode().id === child.getNode().id,
            )
        ) {
            this.children.push({ connections, node: child });
            child.addParent(this, connections);
        }
    };

    addParent = (parent: IExecutableNode, connections: SGEdge[]) => {
        if (
            !this.parents.some(
                (p) => p.node.getNode().id === parent.getNode().id,
            )
        ) {
            this.parents.push({ connections, node: parent, value: undefined });
        }
    };

    /** All children of this node gets called with all of my output values.  */
    callChildren = async (outputValue: ResolvedIO[]) => {
        this.results = outputValue;
        await Promise.all(
            this.children.map((child) =>
                child.node.onParentCalling(this, outputValue),
            ),
        );
    };

    onParentCalling = async (parent: IExecutableNode, value: ResolvedIO[]) => {
        const existing = this.parents.find(
            (p) => p.node.getNode().id === parent.getNode().id,
        );
        if (existing) {
            existing.value = value;
        }

        /** If any parents are not resolved yet */
        if (this.parents.some((p) => p.value === undefined)) {
            return;
        } else {
            await this.run(this.collectParentResults());
        }
    };

    /** Map parent connection to correct inputs */
    collectParentResults = (): ResolvedIO[] => {
        const parentOutputs: ResolvedIO[] = [];

        this.parents.forEach(({ connections, value }) => {
            connections.forEach(({ targetHandle, sourceHandle }) => {
                parentOutputs[parseInt(targetHandle)] =
                    value![parseInt(sourceHandle)];
            });
        });

        return parentOutputs;
    };
}
