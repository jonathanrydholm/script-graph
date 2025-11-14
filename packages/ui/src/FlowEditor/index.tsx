import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type DragEventHandler,
} from 'react';
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    type Edge,
    type Node,
    useReactFlow,
    type NodeChange,
    type EdgeChange,
    type Connection,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { GeneralNode } from './Nodes/General';
import { useParams } from 'react-router-dom';
import type {
    IO,
    NodeBlueprint,
    NodeConfig,
    ProjectFlow,
} from '@script-graph/core';
import { Stack } from '@mui/material';
import Blueprints from './Blueprints';
import { useSnackbar } from 'notistack';
import NodeConfiguration from './NodeConfiguration';
import { StoreContext } from '../Providers/Store';
import FlowDetails from './Details';

type SearchParams = {
    id: string;
};

const FlowEditor = () => {
    const { store, setStore } = useContext(StoreContext);
    const { id } = useParams<SearchParams>();

    const { screenToFlowPosition, addNodes } = useReactFlow();

    const { enqueueSnackbar } = useSnackbar();

    const [flow, setFlow] = useState<ProjectFlow | null>(null);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    useEffect(() => {
        if (id && store.selectedProject) {
            window.api.getFlow(store.selectedProject.path, id).then(setFlow);
        } else {
            setFlow(null);
        }
    }, [id, store.selectedProject]);

    useEffect(() => {
        if (flow) {
            setNodes(
                flow.nodes.map((node) => ({
                    id: node.id,
                    position: {
                        x: node.graphics.x,
                        y: node.graphics.y,
                    },
                    type: 'General',
                    data: {
                        config: node.config,
                        inputs: node.inputs,
                        outputs: node.outputs,
                        name: node.name,
                        type: node.type,
                    } as NodeBlueprint,
                })),
            );
            setEdges(
                flow.edges.map((edge) => ({
                    ...edge,
                    animated: true,
                    style: { stroke: '#FFE599' },
                })),
            );
        }
    }, [flow]);

    const [droppedBlueprint, setDroppedBlueprint] =
        useState<Node<NodeBlueprint> | null>(null);

    const onDragOver: DragEventHandler<HTMLDivElement> = useCallback(
        (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
        },
        [],
    );

    const onDrop: DragEventHandler<HTMLDivElement> = useCallback(
        (event) => {
            event.preventDefault();
            const blueprintString =
                event.dataTransfer.getData('application/json');

            const blueprint = JSON.parse(blueprintString) as NodeBlueprint;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            if (blueprint.config.fields.some((f) => f.required)) {
                setDroppedBlueprint({
                    id: crypto.randomUUID(),
                    data: blueprint,
                    position,
                    type: 'General',
                });
            } else {
                addNodes({
                    id: crypto.randomUUID(),
                    data: blueprint,
                    position,
                    type: 'General',
                });
            }
        },
        [screenToFlowPosition, addNodes],
    );

    const onNodesChange = useCallback(
        (changes: NodeChange<Node>[]) =>
            setNodes((nds) => applyNodeChanges(changes, nds)),
        [],
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange<Edge>[]) =>
            setEdges((eds) => applyEdgeChanges(changes, eds)),
        [],
    );

    const onConnect = useCallback(
        (params: Connection) =>
            setEdges((eds) =>
                addEdge(
                    params,
                    eds.map((edge) => ({
                        ...edge,
                        animated: true,
                        style: { stroke: '#FFE599' },
                    })),
                ),
            ),
        [],
    );

    const nodeTypes: NodeTypes = useMemo(
        () => ({
            General: GeneralNode,
        }),
        [],
    );

    return (
        <Stack
            direction="row"
            width="100%"
            height="100%"
            gap={2}
            sx={{ backgroundColor: '#191B1F' }}
        >
            <NodeConfiguration
                blueprint={droppedBlueprint}
                onCancel={() => setDroppedBlueprint(null)}
                onSave={(blueprint) => {
                    if (nodes.some((n) => n.id === blueprint.id)) {
                        setNodes((nodes) =>
                            nodes.map((n) =>
                                n.id === blueprint.id ? blueprint : n,
                            ),
                        );
                        setDroppedBlueprint(null);
                        enqueueSnackbar(`Updated node ${blueprint.data.type}`, {
                            variant: 'success',
                        });
                        return;
                    }
                    addNodes(blueprint);
                    setDroppedBlueprint(null);
                    enqueueSnackbar(`Created node ${blueprint.data.type}`, {
                        variant: 'success',
                    });
                }}
            />
            <Stack flex={1} pb={2}>
                <ReactFlow
                    nodeTypes={nodeTypes}
                    minZoom={0.1}
                    nodes={nodes}
                    edges={edges}
                    colorMode="dark"
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={(_, node) =>
                        setDroppedBlueprint(node as Node<NodeBlueprint>)
                    }
                    onConnect={onConnect}
                    style={{ borderRadius: '4px' }}
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        bgColor="#191B1F"
                        gap={40}
                        size={4}
                        color="rgba(255, 255, 255, 0.05)"
                    />
                </ReactFlow>
            </Stack>
            <Stack
                width="250px"
                sx={{
                    backgroundColor: '#202228',
                    borderRadius: '4px',
                    boxShadow: '0 -2px 8px 0 rgba(0, 0, 0, 0.5)',
                }}
                pb={2}
            >
                <Blueprints />
                {flow && (
                    <FlowDetails
                        flow={flow}
                        onDelete={() => {
                            if (flow && store?.selectedProject?.path) {
                                window.api
                                    .updateProject({
                                        path: store.selectedProject.path,
                                        flows: store.selectedProject.flows.filter(
                                            (f) => f.id !== flow.id,
                                        ),
                                    })
                                    .then((updatedProject) => {
                                        enqueueSnackbar('Flow deleted', {
                                            variant: 'success',
                                        });
                                        setStore((prev) => ({
                                            ...prev,
                                            selectedProject: updatedProject,
                                        }));
                                    })
                                    .catch(() =>
                                        enqueueSnackbar(
                                            'Could not save flow.',
                                            {
                                                variant: 'error',
                                            },
                                        ),
                                    );
                            }
                        }}
                        onSave={(name) => {
                            if (flow && store?.selectedProject?.path) {
                                window.api
                                    .updateFlow(store.selectedProject.path, {
                                        id: flow.id,
                                        edges: edges.map((edge) => ({
                                            id: edge.id,
                                            source: edge.source,
                                            sourceHandle:
                                                edge.sourceHandle as string,
                                            target: edge.target,
                                            targetHandle:
                                                edge.targetHandle as string,
                                        })),
                                        name,
                                        nodes: nodes.map((node) => ({
                                            config: node.data
                                                .config as NodeConfig,
                                            graphics: {
                                                x: node.position.x,
                                                y: node.position.y,
                                                w: node.width!,
                                                h: node.height!,
                                            },
                                            id: node.id,
                                            inputs: node.data.inputs as IO[],
                                            name: node.data.name as string,
                                            outputs: node.data.outputs as IO[],
                                            type: node.data.type as string,
                                        })),
                                    })
                                    .then(() =>
                                        enqueueSnackbar('Saved flow!', {
                                            variant: 'success',
                                        }),
                                    )
                                    .catch(() =>
                                        enqueueSnackbar(
                                            'Could not save flow.',
                                            {
                                                variant: 'error',
                                            },
                                        ),
                                    );
                            }
                        }}
                    />
                )}
            </Stack>
        </Stack>
    );
};

export default FlowEditor;
