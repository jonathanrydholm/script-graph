import { Badge, IconButton, Stack, Tooltip } from '@mui/material';
import {
    Handle,
    Position,
    useNodeConnections,
    type HandleType,
    type Node,
    type NodeProps,
} from '@xyflow/react';
import { useCallback, useMemo } from 'react';
import { CirclePower, Logs } from 'lucide-react';
import { useNodeLogs } from '../../Providers/NodeLogs';
import { useNodeContext } from '../NodeProvider';
import type { IO, SerializedSGNode } from '@script_graph/plugin-types';

export type IGeneralNode = Node<SerializedSGNode>;

export const GeneralNode = ({ id, data }: NodeProps<IGeneralNode>) => {
    const { logs, status, setNodeLog } = useNodeLogs(id);
    const { connectionEstablish } = useNodeContext();

    const connections = useNodeConnections({});

    const ioState = useCallback(
        (io: IO, handleType: HandleType, index: number) => {
            if (handleType === 'target') {
                if (
                    connections.some(
                        (c) => c.target === id && c.targetHandle === `${index}`,
                    )
                ) {
                    return '#FFE599';
                }
            } else {
                if (
                    connections.some(
                        (c) => c.source === id && c.sourceHandle === `${index}`,
                    )
                ) {
                    return '#FFE599';
                }
            }
            if (connectionEstablish) {
                if (connectionEstablish.nodeId !== id) {
                    if (
                        io.type === connectionEstablish.io.type &&
                        handleType !== connectionEstablish.handleType
                    ) {
                        return '#359A84';
                    }
                }
            }
            if (io.required && handleType === 'target') {
                return '#EE6983';
            }
            return '#eee';
        },
        [connectionEstablish, id, connections],
    );

    const inputs = useMemo(() => {
        return data.inputs.map((input, index) => {
            return (
                <Tooltip title={input.type} key={index}>
                    <Handle
                        key={index}
                        type="target"
                        position={Position.Left}
                        id={`${index}`}
                        style={{
                            width: 12,
                            height: 12,
                            minWidth: 12,
                            minHeight: 12,
                            maxWidth: 12,
                            maxHeight: 12,
                            backgroundColor: ioState(input, 'target', index),
                            position: 'initial',
                            transform: 'none',
                        }}
                    />
                </Tooltip>
            );
        });
    }, [data.inputs, ioState]);

    const outputs = useMemo(() => {
        return data.outputs.map((output, index) => {
            return (
                <Tooltip title={output.type} key={index}>
                    <Handle
                        key={index}
                        type="source"
                        position={Position.Right}
                        id={`${index}`}
                        style={{
                            width: 12,
                            height: 12,
                            minWidth: 12,
                            minHeight: 12,
                            maxWidth: 12,
                            maxHeight: 12,
                            backgroundColor: ioState(output, 'source', index),
                            position: 'initial',
                            transform: 'none',
                        }}
                    />
                </Tooltip>
            );
        });
    }, [data.outputs, ioState]);

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

    if (data.type === 'entrypoint') {
        return (
            <Stack
                width={'48px'}
                height={'48px'}
                borderRadius={'50%'}
                border={border}
                justifyContent="center"
                alignItems="center"
                bgcolor="#202228"
                direction="row"
                position="relative"
            >
                <CirclePower color="#359A84" />
                <Stack
                    gap={1}
                    py={1}
                    justifyContent="space-between"
                    sx={{ transform: 'translateX(6px)' }}
                    position="absolute"
                    right={0}
                >
                    {outputs}
                </Stack>
            </Stack>
        );
    }

    return (
        <Stack
            gap={4}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            color="#fff"
            bgcolor="#202228"
            border={border}
            borderRadius="4px"
            position="relative"
        >
            <Stack
                gap={1}
                py={1}
                justifyContent="space-between"
                sx={{ transform: 'translateX(-6px)' }}
            >
                {inputs}
            </Stack>
            {data.name}
            {logs.length > 0 && (
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        setNodeLog((prev) => ({
                            ...prev,
                            drawerOpen: true,
                            nodeFilter: id,
                        }));
                    }}
                >
                    <Badge color="primary" badgeContent={logs.length}>
                        <Logs />
                    </Badge>
                </IconButton>
            )}
            <Stack
                gap={1}
                py={1}
                justifyContent="space-between"
                sx={{ transform: 'translateX(6px)' }}
            >
                {outputs}
            </Stack>
        </Stack>
    );
};
