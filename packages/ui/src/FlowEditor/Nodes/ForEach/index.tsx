import { Stack } from '@mui/material';
import {
    NodeResizer,
    useUpdateNodeInternals,
    type Node,
    type NodeProps,
} from '@xyflow/react';
import type { SerializedSGNode } from '@script_graph/plugin-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNodeLogs } from '../../../Providers/NodeLogs';
import { IOHandle } from '../../IOHandle';
import { useDropHandler } from '../../Hooks';

export type IForEachNode = Node<SerializedSGNode>;

export const ForEachNode = ({
    id,
    positionAbsoluteX,
    positionAbsoluteY,
    data,
    parentId,
}: NodeProps<IForEachNode>) => {
    const { status } = useNodeLogs(id);

    const [draggingOver, setDraggingOver] = useState(false);

    const { border } = useMemo(() => {
        if (!status) {
            return {
                border: '1px solid #3c3c3c',
            };
        }
        return {
            border: status.success ? '1px solid #8BAE66' : '1px solid #EE6983',
        };
    }, [status]);

    const afterDrop = useCallback(() => setDraggingOver(false), []);

    const dropHandler = useDropHandler(
        afterDrop,
        positionAbsoluteX - 100,
        positionAbsoluteY - 40,
        id,
    );

    const updateNodeInternals = useUpdateNodeInternals();

    useEffect(() => {
        updateNodeInternals(id);
    }, [id]);

    return (
        <>
            <NodeResizer
                minWidth={100}
                minHeight={100}
                lineStyle={{
                    borderWidth: '16px',
                    borderColor: 'transparent',
                    background: 'transparent',
                }}
                handleStyle={{
                    borderWidth: '16px',
                    borderColor: 'transparent',
                    background: 'transparent',
                }}
            />
            <Stack
                width="100%"
                height="100%"
                direction="row"
                onDrop={dropHandler}
                border={border}
                borderRadius="4px"
                sx={{
                    transition: 'all 200ms ease',
                    boxShadow: 'inset 0 0 8px 0 rgba(0, 0, 0, 0.5)',
                }}
                onDragEnter={(e) => {
                    e.stopPropagation();
                    setDraggingOver(true);
                }}
                onDragLeave={(e) => {
                    e.stopPropagation();
                    setDraggingOver(false);
                }}
                bgcolor={
                    draggingOver ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'
                }
            >
                <Stack justifyContent="center" width="40px" height="100%">
                    <Stack
                        direction="row"
                        width="100%"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <IOHandle
                            handleType="target"
                            index={0}
                            io={data.inputs[0]}
                            nodeId={id}
                            parentId={parentId}
                        />

                        <IOHandle
                            handleType="source"
                            index={0}
                            io={data.outputs[0]}
                            nodeId={id}
                            parentId={parentId}
                        />
                    </Stack>
                </Stack>
                <Stack justifyContent="center" flex={1} height="100%"></Stack>
            </Stack>
        </>
    );
};
