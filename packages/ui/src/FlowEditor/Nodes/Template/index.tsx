import { Stack } from '@mui/material';
import {
    NodeResizer,
    useReactFlow,
    useUpdateNodeInternals,
    type Node,
    type NodeProps,
} from '@xyflow/react';
import type {
    IO,
    NodeConfigStringField,
    SerializedSGNode,
} from '@script_graph/plugin-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNodeLogs } from '../../../Providers/NodeLogs';
import { IOHandle } from '../../IOHandle';
import { useDropHandler } from '../../Hooks';

export type ITemplateNode = Node<SerializedSGNode>;

export const TemplateNode = ({
    id,
    positionAbsoluteX,
    positionAbsoluteY,
    data,
    parentId,
}: NodeProps<ITemplateNode>) => {
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

    const { addNodes, addEdges, updateNode } = useReactFlow();

    const [inputs, setInputs] = useState<IO[]>([]);

    const updateNodeInternals = useUpdateNodeInternals();

    const { flowId, projectId } = useMemo(() => {
        return {
            flowId: (
                data.config.fields.find(
                    (field) =>
                        field.type === 'string' && field.field === 'flowId',
                ) as NodeConfigStringField
            )?.value,
            projectId: (
                data.config.fields.find(
                    (field) =>
                        field.type === 'string' && field.field === 'projectId',
                ) as NodeConfigStringField
            )?.value,
        };
    }, [data.config]);

    useEffect(() => {
        if (flowId && projectId) {
            window.api.getFlow(projectId, flowId).then((projectFlow) => {
                // TODO. Re-create flow ids
                const inputs = projectFlow.nodes.filter(
                    (n) => n.type === 'Input',
                );

                const mappedTemplateNodes = projectFlow.nodes
                    .filter((n) => n.type !== 'Input')
                    .map(
                        (node) =>
                            ({
                                id: node.id,
                                position: {
                                    x: node.graphics.x,
                                    y: node.graphics.y,
                                },
                                type: ['ForEach', 'Input', 'Template'].includes(
                                    node.type,
                                )
                                    ? node.type
                                    : 'General',
                                parentId: !node.parentId ? id : node.parentId,
                                width: node.graphics.w,
                                height: node.graphics.h,
                                extent: 'parent',
                                data: {
                                    config: node.config,
                                    inputs: node.inputs,
                                    outputs: node.outputs,
                                    name: node.name,
                                    type: node.type,
                                    graphics: node.graphics,
                                    id: node.id,
                                    tags: node.tags,
                                } as SerializedSGNode,
                            }) as Node<SerializedSGNode>,
                    );

                addNodes(mappedTemplateNodes);

                const virtualizedInputs = inputs.flatMap((virtualInput) => {
                    const connection = projectFlow.edges.find(
                        (conn) => conn.source === virtualInput.id,
                    );

                    if (connection) {
                        const connectedNode = projectFlow.nodes.find(
                            (n) => n.id === connection.target,
                        );
                        if (connectedNode) {
                            return [
                                connectedNode?.inputs[
                                    parseInt(connection.targetHandle)
                                ],
                            ];
                        }
                    }
                    return [];
                });

                setInputs(virtualizedInputs);

                inputs.forEach((inputNode, index) => {
                    projectFlow.edges.forEach((edge) => {
                        if (edge.source === inputNode.id) {
                            edge.source = id;
                            edge.sourceHandle = `${index}`;
                        }
                        edge.id = crypto.randomUUID();
                    });
                });

                addEdges(
                    projectFlow.edges.map((edge) => ({
                        ...edge,
                        animated: true,
                        style: { stroke: '#FFE599' },
                    })),
                );

                if (!data.graphics.w && !data.graphics.h) {
                    const bounds = {
                        x1: Number.MAX_SAFE_INTEGER,
                        x2: Number.MIN_SAFE_INTEGER,
                        y1: Number.MAX_SAFE_INTEGER,
                        y2: Number.MIN_SAFE_INTEGER,
                    };

                    projectFlow.nodes.forEach((node) => {
                        if (node.graphics.x < bounds.x1) {
                            bounds.x1 = node.graphics.x;
                        }
                        if (node.graphics.y < bounds.y1) {
                            bounds.y1 = node.graphics.y;
                        }

                        if (node.graphics.x + node.graphics.w > bounds.x2) {
                            bounds.x2 = node.graphics.x + node.graphics.w;
                        }

                        if (node.graphics.y + node.graphics.h > bounds.y2) {
                            bounds.y2 = node.graphics.y + node.graphics.h;
                        }
                    });

                    updateNode(id, {
                        width: bounds.x2 - bounds.x1,
                        height: bounds.y2 - bounds.y1,
                    });
                }

                updateNodeInternals(id);
            });
        }
    }, [
        flowId,
        projectId,
        id,
        addNodes,
        addEdges,
        updateNodeInternals,
        updateNode,
        data,
        // Fetch flow. Add nodes here. Drop handler not allowed on templates.
        /*
                
            */
    ]);

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
                    {inputs.map((io, index) => (
                        <Stack
                            direction="row"
                            width="100%"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <IOHandle
                                handleType="target"
                                index={index}
                                io={io}
                                nodeId={id}
                                parentId={parentId}
                            />

                            <IOHandle
                                handleType="source"
                                index={index}
                                io={io}
                                nodeId={id}
                                parentId={parentId}
                            />
                        </Stack>
                    ))}
                </Stack>
                <Stack justifyContent="center" flex={1} height="100%"></Stack>
            </Stack>
        </>
    );
};
