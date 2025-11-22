import { createContext, useContext, useState } from 'react';
import type { HandleType, Node } from '@xyflow/react';
import type { IO, SerializedSGNode } from '@script_graph/plugin-types';

export interface INodeContext {
    setConnectionEstablish: React.Dispatch<
        React.SetStateAction<IConnectionEstablish | null>
    >;
    connectionEstablish: IConnectionEstablish | null;

    setDroppedBlueprint: React.Dispatch<
        React.SetStateAction<Node<SerializedSGNode> | null>
    >;
    droppedBlueprint: Node<SerializedSGNode> | null;
}

interface IConnectionEstablish {
    nodeId: string;
    handleType: HandleType;
    io: IO;
    parentId?: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const NodeContext = createContext<INodeContext>({} as INodeContext);

interface INodeProvider {
    children: React.ReactElement;
}

export const useNodeContext = () => {
    return useContext(NodeContext);
};

export const NodeProvider = ({ children }: INodeProvider) => {
    const [connectionEstablish, setConnectionEstablish] =
        useState<IConnectionEstablish | null>(null);

    const [droppedBlueprint, setDroppedBlueprint] =
        useState<Node<SerializedSGNode> | null>(null);

    return (
        <NodeContext.Provider
            value={{
                connectionEstablish,
                setConnectionEstablish,
                droppedBlueprint,
                setDroppedBlueprint,
            }}
        >
            {children}
        </NodeContext.Provider>
    );
};
