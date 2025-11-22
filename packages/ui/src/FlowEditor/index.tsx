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
import { ForEachNode } from './Nodes/ForEach';
import { PluginPanel } from './PluginPanel';
import { useDropHandler } from './Hooks';
import { InputNode } from './Nodes/Input';
import { TemplateNode } from './Nodes/Template';

type SearchParams = {
    projectId: string;
    flowId: string;
};

const FlowEditor = () => {
    const { store } = useContext(StoreContext);
    const { flowId, projectId } = useParams<SearchParams>();

    const { addNodes } = useReactFlow();

    const { enqueueSnackbar } = useSnackbar();

    const { setDroppedBlueprint, droppedBlueprint } = useNodeContext();

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

    useEffect(() => {
        if (flow) {
            setNodes(
                flow.nodes.map((node) => ({
                    id: node.id,
                    position: {
                        x: node.graphics.x,
                        y: node.graphics.y,
                    },
                    type: ['ForEach', 'Input', 'Template'].includes(node.type)
                        ? node.type
                        : 'General',
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

    const onDragOver: DragEventHandler<HTMLDivElement> = useCallback(
        (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
        },
        [],
    );

    const afterDrop = useCallback(console.log, []);

    const dropHandler = useDropHandler(afterDrop, -100, -40, undefined);

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
            Input: InputNode,
            Template: TemplateNode,
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
                                        parentId: source.id,
                                    });
                                    return;
                                }
                            }
                        }
                    } else if (source.type === 'Input') {
                        setConnectionEstablish({
                            handleType: params.handleType,
                            io: source.data.outputs[parseInt(params.handleId)],
                            nodeId: params.nodeId,
                            parentId: source.id,
                        });
                        return;
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
                    onDrop={dropHandler}
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
                                        const templateNodeIds = new Set<string>(
                                            nodes
                                                .filter(
                                                    (n) =>
                                                        n.type === 'Template',
                                                )
                                                .map((n) => n.id),
                                        );

                                        const nodesToSave =
                                            subflowRequirementSorting(
                                                nodes.filter((n) =>
                                                    n.parentId
                                                        ? !templateNodeIds.has(
                                                              n.parentId,
                                                          )
                                                        : true,
                                                ),
                                            );

                                        window.api
                                            .updateProject({
                                                ...project,
                                                flows: project.flows.map(
                                                    (f) => {
                                                        if (f.id !== flowId) {
                                                            return f;
                                                        }
                                                        return {
                                                            ...flow,
                                                            name,
                                                            edges: edges
                                                                .filter(
                                                                    (e) =>
                                                                        !templateNodeIds.has(
                                                                            e.source,
                                                                        ) &&
                                                                        nodesToSave.some(
                                                                            (
                                                                                n,
                                                                            ) =>
                                                                                e.source ===
                                                                                    n.id ||
                                                                                e.target ===
                                                                                    n.id,
                                                                        ),
                                                                )
                                                                .map(
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
                                                            nodes: nodesToSave.map(
                                                                (node) => ({
                                                                    config: node
                                                                        .data
                                                                        .config as NodeConfig,
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

export function subflowRequirementSorting(
    nodes: Node<SerializedSGNode>[],
): Node<SerializedSGNode>[] {
    const nodeMap = new Map<string, Node<SerializedSGNode>>();
    const childrenMap = new Map<
        string | null | undefined,
        Node<SerializedSGNode>[]
    >();

    // Index nodes and group children
    for (const node of nodes) {
        nodeMap.set(node.id, node);

        const parent = node.parentId ?? null; // normalize undefined → null
        if (!childrenMap.has(parent)) {
            childrenMap.set(parent, []);
        }
        childrenMap.get(parent)!.push(node);
    }

    const sorted: Node<SerializedSGNode>[] = [];

    // Depth-first walk to ensure parents come before children
    const dfs = (parentId: string | null) => {
        const children = childrenMap.get(parentId) || [];
        for (const child of children) {
            sorted.push(child);
            dfs(child.id);
        }
    };

    // Start from all root nodes (those without parentNode)
    dfs(null);

    return sorted;
}
