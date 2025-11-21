import { Badge, IconButton, Stack } from '@mui/material';
import { type Node, type NodeProps } from '@xyflow/react';
import { useMemo } from 'react';
import { CirclePower, Logs } from 'lucide-react';
import { useNodeLogs } from '../../Providers/NodeLogs';
import type { SerializedSGNode } from '@script_graph/plugin-types';
import { IOHandle } from '../IOHandle';

export type IGeneralNode = Node<SerializedSGNode>;

export const GeneralNode = ({
    id,
    data,
    parentId,
}: NodeProps<IGeneralNode>) => {
    const { logs, status, setNodeLog } = useNodeLogs(id);

    const inputs = useMemo(() => {
        return data.inputs.map((input, index) => {
            return (
                <IOHandle
                    key={index}
                    handleType="target"
                    index={index}
                    io={input}
                    nodeId={id}
                    parentId={parentId}
                />
            );
        });
    }, [data.inputs, id, parentId]);

    const outputs = useMemo(() => {
        return data.outputs.map((output, index) => {
            return (
                <IOHandle
                    key={index}
                    handleType="source"
                    index={index}
                    io={output}
                    nodeId={id}
                    parentId={parentId}
                />
            );
        });
    }, [data.outputs, id, parentId]);

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
            width="100%"
            height="100%"
            sx={{ transition: 'all 200ms ease' }}
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
