import type { NodeBlueprint } from '@script_graph/core';
import { Badge, IconButton, Stack, Tooltip } from '@mui/material';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { useMemo } from 'react';
import { Logs } from 'lucide-react';
import { useNodeLogs } from '../../Providers/NodeLogs';

export type IConstantNode = Node<NodeBlueprint>;

export const GeneralNode = ({ id, data }: NodeProps<IConstantNode>) => {
    const { logs, status, setNodeLog } = useNodeLogs(id);

    const inputs = useMemo(() => {
        return data.inputs.map((input, index) => {
            return (
                <Stack direction="row">
                    <Tooltip title={input.type}>
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
                                backgroundColor: '#FFE599',
                            }}
                        />
                    </Tooltip>
                </Stack>
            );
        });
    }, [data.inputs]);

    const outputs = useMemo(() => {
        return data.outputs.map((output, index) => {
            return (
                <Stack direction="row">
                    <Tooltip title={output.type}>
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
                                backgroundColor: '#FFE599',
                            }}
                        />
                    </Tooltip>
                </Stack>
            );
        });
    }, [data.outputs]);

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

    return (
        <Stack
            gap={4}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            color="#fff"
            bgcolor="#202228"
            px={1}
            py={2}
            border={border}
            borderRadius="4px"
            position="relative"
        >
            <Stack gap={1}>{inputs}</Stack>
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
            <Stack gap={1}>{outputs}</Stack>
        </Stack>
    );
};
