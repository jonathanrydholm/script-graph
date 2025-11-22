import type { SerializedSGNode } from '@script_graph/plugin-types';
import { useCallback, type DragEventHandler } from 'react';
import { useNodeContext } from '../NodeProvider';
import { type Node, useReactFlow } from '@xyflow/react';
import type { ProjectConfig, ProjectFlow } from '@script_graph/general-types';

export const useDropHandler = (
    afterDrop: () => void,
    offsetX: number,
    offsetY: number,
    parentId?: string,
) => {
    const { addNodes, screenToFlowPosition, addEdges } = useReactFlow();

    const { setDroppedBlueprint } = useNodeContext();

    const onDrop: DragEventHandler<HTMLDivElement> = useCallback(
        (event) => {
            event.preventDefault();
            event.stopPropagation();
            for (const transferType of event.dataTransfer.types) {
                if (transferType === 'script_graph/blueprint') {
                    const blueprintString =
                        event.dataTransfer.getData(transferType);
                    const blueprint = JSON.parse(
                        blueprintString,
                    ) as SerializedSGNode;

                    const initialWidth = 200;
                    const initialHeight = 80;

                    const position = screenToFlowPosition({
                        x: event.clientX - offsetX - initialWidth,
                        y: event.clientY - offsetY - initialHeight,
                    });

                    const droppedBlueprint: Node<SerializedSGNode> = {
                        id: crypto.randomUUID(),
                        data: blueprint,
                        position,
                        type: ['ForEach', 'Input', 'Template'].includes(
                            blueprint.type,
                        )
                            ? blueprint.type
                            : 'General',
                        parentId,
                        extent: parentId ? 'parent' : undefined,
                        width: initialWidth,
                        height: initialHeight,
                    };

                    if (blueprint.config.fields.some((f) => f.required)) {
                        setDroppedBlueprint(droppedBlueprint);
                    }

                    addNodes(droppedBlueprint);
                } else if (transferType === 'script_graph/template') {
                    const templateString =
                        event.dataTransfer.getData(transferType);
                    const { flow, project } = JSON.parse(templateString) as {
                        project: ProjectConfig;
                        flow: ProjectFlow;
                    };

                    const templateNodeId = crypto.randomUUID();

                    const position = screenToFlowPosition({
                        x: event.clientX - offsetX - 500,
                        y: event.clientY - offsetY - 500,
                    });

                    const templateNode: Node<SerializedSGNode> = {
                        id: templateNodeId,
                        data: {
                            id: templateNodeId,
                            config: {
                                fields: [
                                    {
                                        field: 'flowId',
                                        type: 'string',
                                        value: flow.id,
                                        required: true,
                                    },
                                    {
                                        field: 'projectId',
                                        type: 'string',
                                        value: project.id,
                                        required: true,
                                    },
                                ],
                            },
                            graphics: {
                                h: 0,
                                w: 0,
                                x: 0,
                                y: 0,
                            },
                            inputs: [],
                            outputs: [],
                            name: `${project.name} -> ${flow.name}`,
                            type: 'Template',
                            tags: [],
                        },
                        position,
                        type: 'Template',
                        parentId,
                        extent: parentId ? 'parent' : undefined,
                        width: 500,
                        height: 500,
                    };
                    addNodes(templateNode);
                }
            }

            afterDrop();
        },
        [
            addNodes,
            screenToFlowPosition,
            parentId,
            offsetX,
            offsetY,
            afterDrop,
            setDroppedBlueprint,
            addEdges,
        ],
    );

    return onDrop;
};
