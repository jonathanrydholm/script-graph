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
    Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { GeneralNode } from './Nodes/General';
import { useParams } from 'react-router-dom';
import { Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import NodeConfiguration from './NodeConfiguration';
import { StoreContext } from '../Providers/Store';
import FlowDetails from './Details';
import { useNodeContext } from './NodeProvider';
import type {
    ArrayIO,
    IO,
    NodeConfig,
    SerializedSGNode,
} from '@script_graph/plugin-types';
import type { MetaNode, ProjectFlow } from '@script_graph/general-types';
import { ForEachNode } from './Nodes/ForEach';
import { PluginPanel } from './PluginPanel';

type SearchParams = {
    projectId: string;
    flowId: string;
};

const FlowEditor = () => {
    const { store } = useContext(StoreContext);
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
                        flow.nodes.filter((n) => n.parentId === meta.id),
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
                    type: node.type === 'ForEach' ? 'ForEach' : 'General',
                    parentId: node.parentId,
                    width: node.graphics.w,
                    height: node.graphics.h,
                    extent: node.parentId ? 'parent' : undefined,
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
                            type:
                                blueprint.type === 'ForEach'
                                    ? 'ForEach'
                                    : 'General',
                            width: 200,
                            height: 80,
                        });
                    } else {
                        addNodes({
                            id: crypto.randomUUID(),
                            data: blueprint,
                            position,
                            type:
                                blueprint.type === 'ForEach'
                                    ? 'ForEach'
                                    : 'General',
                            width: 200,
                            height: 80,
                        });
                    }
                } else if (transferType === 'script_graph/special') {
                    const newId = crypto.randomUUID();
                    addNodes({
                        id: newId,
                        data: {
                            config: {
                                fields: [],
                            },
                            graphics: { h: 0, w: 0, x: 0, y: 0 },
                            id: newId,
                            inputs: [
                                {
                                    type: 'void',
                                },
                            ],
                            name: 'ForEach',
                            type: 'ForEach',
                            outputs: [
                                {
                                    type: 'void',
                                },
                            ],
                            tags: [],
                        } as SerializedSGNode,
                        position,
                        type: event.dataTransfer.getData(transferType),
                        width: 400,
                        height: 400,
                    });
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
                        style: { stroke: '#FFE599', zIndex: 1000 },
                    },
                    eds,
                ),
            ),
        [],
    );

    const nodeTypes: NodeTypes = useMemo(
        () => ({
            General: GeneralNode,
            ForEach: ForEachNode,
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
                const source = nodes.find((n) => n.id === params.nodeId);
                if (source) {
                    if (source.data.type === 'ForEach') {
                        const forEachInput = source.data.inputs[0] as ArrayIO;

                        if (!forEachInput) {
                            // TODO, show LOADS of warnings. Maybe isValidConnection could be omitted?
                            return;
                        }

                        const connectedEdge = edges.find(
                            (e) => e.target === source.id,
                        );
                        if (connectedEdge) {
                            const ancestor = nodes.find(
                                (n) => n.id === connectedEdge.source,
                            );
                            if (ancestor) {
                                const ancestorOutput =
                                    ancestor.data.outputs[
                                        parseInt(connectedEdge.sourceHandle!)
                                    ];
                                if (
                                    ancestorOutput &&
                                    ancestorOutput.type === 'array'
                                ) {
                                    setConnectionEstablish({
                                        handleType: params.handleType,
                                        io: ancestorOutput.elements,
                                        nodeId: params.nodeId,
                                        parentId: source.parentId,
                                    });
                                    return;
                                }
                            }
                        }
                    }

                    const output =
                        source.data.outputs[parseInt(params.handleId)];
                    if (output) {
                        setConnectionEstablish({
                            handleType: params.handleType,
                            io: output,
                            nodeId: params.nodeId,
                            parentId: source.parentId,
                        });
                    }
                }
            }
        },
        [nodes, setConnectionEstablish, edges],
    );

    const onConnectionEnd = useCallback(() => {
        setConnectionEstablish(null);
    }, [setConnectionEstablish]);

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
                    deleteKeyCode={['Backspace', 'Delete']}
                    style={{ borderRadius: '4px' }}
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        bgColor="rgba(25, 27, 31, 1)"
                        gap={40}
                        size={4}
                        color="rgba(255, 255, 255, 0.05)"
                    />
                    <Panel position="top-right">
                        {flow && (
                            <FlowDetails
                                flow={flow}
                                onSave={(name) => {
                                    if (project && flow) {
                                        window.api
                                            .updateProject({
                                                ...project,
                                                flows: project.flows.map(
                                                    (f) => {
                                                        if (f.id !== flowId) {
                                                            return flow;
                                                        }
                                                        return {
                                                            id: f.id,
                                                            edges: edges.map(
                                                                (edge) => ({
                                                                    id: edge.id,
                                                                    source: edge.source,
                                                                    sourceHandle:
                                                                        edge.sourceHandle as string,
                                                                    target: edge.target,
                                                                    targetHandle:
                                                                        edge.targetHandle as string,
                                                                }),
                                                            ),
                                                            name,
                                                            nodes: nodes
                                                                .filter(
                                                                    (node) =>
                                                                        node
                                                                            .data
                                                                            .type !==
                                                                        'group',
                                                                )
                                                                .map(
                                                                    (node) => ({
                                                                        config: node
                                                                            .data
                                                                            .config as NodeConfig,
                                                                        graphics:
                                                                            {
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
                                                                        inputs: node
                                                                            .data
                                                                            .inputs as IO[],
                                                                        name: node
                                                                            .data
                                                                            .name as string,
                                                                        outputs:
                                                                            node
                                                                                .data
                                                                                .outputs as IO[],
                                                                        type: node
                                                                            .data
                                                                            .type as string,
                                                                        parentId:
                                                                            node.parentId,
                                                                    }),
                                                                ),
                                                            metaNodes: nodes
                                                                .filter(
                                                                    (node) =>
                                                                        node
                                                                            .data
                                                                            .type ===
                                                                        'group',
                                                                )
                                                                .map(
                                                                    (node) =>
                                                                        ({
                                                                            graphics:
                                                                                {
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
                                                                            name: node
                                                                                .data
                                                                                .name as string,
                                                                            type: node
                                                                                .data
                                                                                .type as string,
                                                                        }) as MetaNode,
                                                                ),
                                                        };
                                                    },
                                                ),
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
                    </Panel>
                </ReactFlow>
            </Stack>
            <PluginPanel />
        </Stack>
    );
};

export default FlowEditor;
