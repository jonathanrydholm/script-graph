import type { IO } from '@script_graph/plugin-types';
import { useNodeConnections, type HandleType } from '@xyflow/react';
import { useMemo } from 'react';
import { useNodeContext } from '../NodeProvider';

type IOState =
    | 'connected'
    | 'not_available'
    | 'available'
    | 'required'
    | 'idle';

/** Get the current state of an input or output.  */
export const useIOState = (
    nodeId: string,
    io: IO,
    handleType: HandleType,
    index: number,
    parentId: string | undefined,
) => {
    const { connectionEstablish } = useNodeContext();
    const connections = useNodeConnections({});

    const ioState: IOState = useMemo(() => {
        if (handleType === 'target') {
            if (
                connections.some(
                    (c) => c.target === nodeId && c.targetHandle === `${index}`,
                )
            ) {
                return 'connected';
            }
        } else {
            if (
                connections.some(
                    (c) => c.source === nodeId && c.sourceHandle === `${index}`,
                )
            ) {
                return 'connected';
            }
        }
        if (connectionEstablish) {
            if (connectionEstablish.nodeId !== nodeId) {
                if (connectionEstablish.io.type === 'inherit') {
                    return 'available';
                }
                /** TODO, check below should be re-visited */
                if (io.type === 'inherit' && handleType === 'target') {
                    return 'available';
                }

                if (
                    io.type === connectionEstablish.io.type &&
                    handleType !== connectionEstablish.handleType
                ) {
                    if (connectionEstablish.parentId !== parentId) {
                        return 'not_available';
                    }
                    return 'available';
                } else {
                    return 'not_available';
                }
            }
        }
        if (io.required && handleType === 'target') {
            return 'required';
        }
        return 'idle';
    }, [
        nodeId,
        io,
        handleType,
        index,
        connectionEstablish,
        connections,
        parentId,
    ]);

    const ioColor = useMemo(() => {
        switch (ioState) {
            case 'available': {
                return '#359A84';
            }
            case 'connected': {
                return '#FFE599';
            }
            case 'idle': {
                return '#eee';
            }
            case 'not_available': {
                return 'transparent';
            }
            case 'required': {
                return '#EE6983';
            }
        }
    }, [ioState]);

    return useMemo(() => {
        return {
            ioColor,
            ioState,
        };
    }, [ioColor, ioState]);
};
