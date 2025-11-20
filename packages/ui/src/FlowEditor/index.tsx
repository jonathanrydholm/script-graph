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
    type OnConnectStartParams,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { GeneralNode } from './Nodes/General';
import { useParams } from 'react-router-dom';
import { Stack } from '@mui/material';
import Blueprints from './Blueprints';
import { useSnackbar } from 'notistack';
import NodeConfiguration from './NodeConfiguration';
import { StoreContext } from '../Providers/Store';
import FlowDetails from './Details';
import { useNodeContext } from './NodeProvider';
import type {
    IO,
    NodeConfig,
    SerializedSGNode,
} from '@script_graph/plugin-types';
import type { MetaNode, ProjectFlow } from '@script_graph/general-types';

type SearchParams = {
    projectId: string;
    flowId: string;
};

const FlowEditor = () => {
    const { store, setStore } = useContext(StoreContext);
    const { flowId, projectId } = useParams<SearchParams>();

    const { screenToFlowPosition, addNodes, addEdges } = useReactFlow();

    const { enqueueSnackbar } = useSnackbar();

    const [nodes, setNodes] = useState<Node<SerializedSGNode>[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    const project = useMemo(() => {
        if (!projectId) {
            return null;
        }
        return (
            store.projects.find((project) => project.id === projectId) || null
        );
    }, [store.projects, projectId]);

    const flow = useMemo(() => {
        if (!flowId || !project) {
            return null;
        }
        return project.flows.find((f) => f.id === flowId) || null;
    }, [project, flowId]);

    const calculateBounds = useCallback((nodes: SerializedSGNode[]) => {
        const bounds = {
            x1: Number.POSITIVE_INFINITY,
            x2: Number.NEGATIVE_INFINITY,
            y1: Number.POSITIVE_INFINITY,
            y2: Number.NEGATIVE_INFINITY,
        };

        nodes.forEach((node) => {
            if (node.graphics.x < bounds.x1) {
                bounds.x1 = node.graphics.x;
            }
            if (node.graphics.x > bounds.x2) {
                bounds.x2 = node.graphics.x;
            }

            if (node.graphics.y < bounds.y1) {
                bounds.y1 = node.graphics.y;
            }
            if (node.graphics.y > bounds.y2) {
                bounds.y2 = node.graphics.y;
            }
        });

        return {
            width: bounds.x2 - bounds.x1,
            height: bounds.y2 - bounds.y1,
        };
    }, []);

    useEffect(() => {
        if (flow) {
            setNodes([
                ...flow.metaNodes.map((meta) => {
                    const { height, width } = calculateBounds(
                        flow.nodes.filter(
                            (n) => n.graphics.parentId === meta.id,
                        ),
                    );
                    return {
                        id: meta.id,
                        position: {
                            x: meta.graphics.x,
                            y: meta.graphics.y,
                        },
                        width,
                        height,
                        type: meta.type,
                        data: {
                            name: meta.name,
                            type: meta.type,
                        } as SerializedSGNode,
                    };
                }),
                ...flow.nodes.map((node) => ({
                    id: node.id,
                    position: {
                        x: node.graphics.x,
                        y: node.graphics.y,
                    },
                    type: 'General',
                    parentId: node.graphics.parentId,
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
                })),
            ]);
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
        useState<Node<SerializedSGNode> | null>(null);

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

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            for (const transferType of event.dataTransfer.types) {
                if (transferType === 'script_graph/flow') {
                    const flowString = event.dataTransfer.getData(transferType);
                    const flow = JSON.parse(flowString) as ProjectFlow;

                    const mappedNodes: Node<SerializedSGNode>[] = [];

                    const nodeIdMap: Record<string, string> = {};

                    const subflowId = crypto.randomUUID();

                    const { height, width } = calculateBounds(flow.nodes);

                    const subflowNode: Node<SerializedSGNode> = {
                        type: 'group',
                        id: subflowId,
                        position,
                        width,
                        height,
                        data: {
                            config: { fields: [] },
                            graphics: { x: 0, y: 0, w: 0, h: 0 },
                            id: subflowId,
                            inputs: [],
                            name: 'Subflow',
                            outputs: [],
                            tags: [],
                            type: 'group',
                        },
                    };

                    flow.nodes.forEach((node) => {
                        const newId = crypto.randomUUID();
                        nodeIdMap[node.id] = newId;

                        mappedNodes.push({
                            id: newId,
                            data: {
                                config: node.config,
                                graphics: node.graphics,
                                id: newId,
                                inputs: node.inputs,
                                name: node.name,
                                outputs: node.outputs,
                                tags: node.tags,
                                type: node.type,
                            },
                            parentId: subflowNode.id,
                            extent: 'parent',
                            position: {
                                x: node.graphics.x,
                                y: node.graphics.y,
                            },
                            type: 'General',
                        });
                    });

                    const mappedEdges = flow.edges.map(
                        (edge) =>
                            ({
                                ...edge,
                                id: crypto.randomUUID(),
                                source: nodeIdMap[edge.source],
                                target: nodeIdMap[edge.target],
                                animated: true,
                                style: { stroke: '#FFE599' },
                            }) as Edge,
                    );

                    addNodes([subflowNode, ...mappedNodes]);

                    addEdges(mappedEdges);
                } else if (transferType === 'script_graph/blueprint') {
                    const blueprintString =
                        event.dataTransfer.getData(transferType);
                    const blueprint = JSON.parse(
                        blueprintString,
                    ) as SerializedSGNode;

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
                }
            }
        },
        [screenToFlowPosition, addNodes, addEdges],
    );

    const onNodesChange = useCallback(
        (changes: NodeChange<Node<SerializedSGNode>>[]) =>
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
                    {
                        ...params,
                        animated: true,
                        style: { stroke: '#FFE599' },
                    },
                    eds,
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

    const { setConnectionEstablish } = useNodeContext();

    const onConnectionStart = useCallback(
        (params: OnConnectStartParams) => {
            if (params.handleId === null || params.nodeId === null) {
                return;
            }
            if (params.handleType === 'source') {
                const node = nodes.find((n) => n.id === params.nodeId);
                if (node) {
                    const output = node.data.outputs[parseInt(params.handleId)];
                    if (output) {
                        setConnectionEstablish({
                            handleType: params.handleType,
                            io: output,
                            nodeId: params.nodeId,
                        });
                    }
                }
            }
        },
        [nodes, setConnectionEstablish],
    );

    const onConnectionEnd = useCallback(() => {
        setConnectionEstablish(null);
    }, [setConnectionEstablish]);

    const isValidConnection = useCallback(
        (link: Edge | Connection) => {
            const source = nodes.find((n) => n.id === link.source);
            const target = nodes.find((n) => n.id === link.target);
            if (
                !source ||
                !target ||
                !link.sourceHandle ||
                !link.targetHandle
            ) {
                return false;
            }
            const output = source.data.outputs[parseInt(link.sourceHandle)];
            const input = target.data.inputs[parseInt(link.targetHandle)];

            if (!output || !input) {
                return false;
            }
            if (output.type !== input.type) {
                // TODO. More granular equality checks when schemas are added.
                return false;
            }

            return true;
        },
        [nodes],
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
                    fitView
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={(_, node) =>
                        setDroppedBlueprint(node as Node<SerializedSGNode>)
                    }
                    onConnect={onConnect}
                    onConnectStart={(_, info) => onConnectionStart(info)}
                    onConnectEnd={onConnectionEnd}
                    isValidConnection={isValidConnection}
                    deleteKeyCode={['Backspace', 'Delete']}
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
                <Blueprints onPluginsModified={() => {}} />
                {flow && (
                    <FlowDetails
                        flow={flow}
                        onSave={(name) => {
                            if (project && flow) {
                                window.api
                                    .updateProject({
                                        ...project,
                                        flows: project.flows.map((f) => {
                                            if (f.id !== flowId) {
                                                return flow;
                                            }
                                            return {
                                                id: f.id,
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
                                                nodes: nodes
                                                    .filter(
                                                        (node) =>
                                                            node.data.type !==
                                                            'group',
                                                    )
                                                    .map((node) => ({
                                                        config: node.data
                                                            .config as NodeConfig,
                                                        graphics: {
                                                            x: node.position.x,
                                                            y: node.position.y,
                                                            w: node.width!,
                                                            h: node.height!,
                                                        },
                                                        tags: [],
                                                        id: node.id,
                                                        inputs: node.data
                                                            .inputs as IO[],
                                                        name: node.data
                                                            .name as string,
                                                        outputs: node.data
                                                            .outputs as IO[],
                                                        type: node.data
                                                            .type as string,
                                                    })),
                                                metaNodes: nodes
                                                    .filter(
                                                        (node) =>
                                                            node.data.type ===
                                                            'group',
                                                    )
                                                    .map(
                                                        (node) =>
                                                            ({
                                                                graphics: {
                                                                    x: node
                                                                        .position
                                                                        .x,
                                                                    y: node
                                                                        .position
                                                                        .y,
                                                                    w: node.width!,
                                                                    h: node.height!,
                                                                },
                                                                tags: [],
                                                                id: node.id,
                                                                name: node.data
                                                                    .name as string,
                                                                type: node.data
                                                                    .type as string,
                                                            }) as MetaNode,
                                                    ),
                                            };
                                        }),
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
