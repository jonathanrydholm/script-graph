import { Stack } from '@mui/material';
import { type Node, type NodeProps } from '@xyflow/react';
import { useMemo } from 'react';
import { Forward } from 'lucide-react';
import type { SerializedSGNode } from '@script_graph/plugin-types';
import { useNodeLogs } from '../../../Providers/NodeLogs';
import { IOHandle } from '../../IOHandle';

export type IInputNode = Node<SerializedSGNode>;

export const InputNode = ({ id, data, parentId }: NodeProps<IInputNode>) => {
    const { status } = useNodeLogs(id);

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
                    maxConnections={1}
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
            <Forward color="#359A84" />
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
};
