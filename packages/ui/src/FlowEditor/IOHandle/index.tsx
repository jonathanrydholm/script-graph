import { Tooltip } from '@mui/material';
import type { IO } from '@script_graph/plugin-types';
import { Handle, useNodeConnections, type HandleType } from '@xyflow/react';
import { Position } from 'reactflow';
import { useIOState } from '../Hooks';
import { useMemo } from 'react';

interface IIOHandle {
    nodeId: string;
    parentId: string | undefined;
    io: IO;
    index: number;
    handleType: HandleType;
    maxConnections?: number;
}

export const IOHandle = ({
    nodeId,
    io,
    index,
    handleType,
    parentId,
    maxConnections,
}: IIOHandle) => {
    const { ioColor, ioState } = useIOState(
        nodeId,
        io,
        handleType,
        index,
        parentId,
    );

    const connections = useNodeConnections({
        handleType,
    });

    return useMemo(() => {
        const size = 12;
        const maxConnectionsReached =
            maxConnections !== undefined
                ? connections.length >= maxConnections
                : false;
        return (
            <Tooltip title={io.type}>
                <Handle
                    type={handleType}
                    position={
                        handleType === 'source' ? Position.Right : Position.Left
                    }
                    isConnectable={
                        !maxConnectionsReached || ioState !== 'not_available'
                    }
                    id={`${index}`}
                    style={{
                        width: size,
                        height: size,
                        minWidth: size,
                        minHeight: size,
                        maxWidth: size,
                        maxHeight: size,
                        backgroundColor: ioColor,
                        borderColor: ioColor,
                        position: 'initial',
                        transform: 'none',
                        transition: 'all 200ms ease',
                    }}
                />
            </Tooltip>
        );
    }, [
        ioColor,
        ioState,
        io.type,
        index,
        handleType,
        connections.length,
        maxConnections,
    ]);
};
