import {
    CircularProgress,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from '@mui/material';
import type { ProjectConfig, ProjectFlow } from '@script_graph/general-types';
import { useNavigate, useParams } from 'react-router-dom';
import { Play, Workflow } from 'lucide-react';
import { useCallback, useContext, useState } from 'react';
import { NodeLogContext } from '../../../Providers/NodeLogs';
import { useSnackbar } from 'notistack';
import { FlowListItemMenu } from './ContextMenu';

interface IFlowListItem {
    flow: ProjectFlow;
    project: ProjectConfig;
}

type SearchParams = {
    flowId: string;
};

export const FlowListItem = ({ flow, project }: IFlowListItem) => {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const { flowId } = useParams<SearchParams>();
    const navigate = useNavigate();

    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
    } | null>(null);

    const handleContextMenu = useCallback(
        (event: React.MouseEvent) => {
            event.preventDefault();

            setContextMenu(
                contextMenu === null
                    ? {
                          mouseX: event.clientX + 2,
                          mouseY: event.clientY - 6,
                      }
                    : null,
            );
        },
        [setContextMenu],
    );

    const { setNodeLog } = useContext(NodeLogContext);

    const executeFlow = useCallback(async () => {
        setLoading(true);
        setNodeLog((prev) => ({
            ...prev,
            drawerOpen: false,
            logsById: {},
            statusById: {},
            nodeFilter: undefined,
        }));

        try {
            await window.api.executeFlow(project.id, flow.id);
            enqueueSnackbar('Succesfull run!', { variant: 'success' });
        } catch (e) {
            enqueueSnackbar(`Something went wrong. ${e}`, {
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [project.id, flow.id]);

    return (
        <>
            <ListItem
                onContextMenu={handleContextMenu}
                disablePadding
                draggable
                onDragStart={(e) => {
                    e.stopPropagation();
                    e.dataTransfer.setData(
                        'script_graph/flow',
                        JSON.stringify(flow),
                    );
                }}
                secondaryAction={
                    <Tooltip title="Execute flow">
                        <IconButton onClick={executeFlow} size="small">
                            {loading ? (
                                <CircularProgress size={24} />
                            ) : (
                                <Play color="#359A84" />
                            )}
                        </IconButton>
                    </Tooltip>
                }
            >
                <ListItemButton
                    onClick={() =>
                        navigate(`/project/${project.id}/flow/${flow.id}`)
                    }
                    sx={{
                        pl: 4,
                        backgroundColor:
                            flowId === flow.id ? '#313339' : undefined,
                    }}
                >
                    <ListItemIcon>
                        <Workflow
                            color={flow.id === flowId ? '#FFE599' : '#AFAFB1'}
                        />
                    </ListItemIcon>
                    <ListItemText
                        primary={flow.name}
                        sx={{
                            color: flow.id === flowId ? '#FFE599' : '#AFAFB1',
                        }}
                    />
                </ListItemButton>
            </ListItem>
            <FlowListItemMenu
                options={contextMenu}
                onClose={() => setContextMenu(null)}
                onDelete={() => {
                    setContextMenu(null);
                    window.api
                        .updateProject({
                            ...project,
                            flows: project.flows.filter(
                                (f) => f.id !== flow.id,
                            ),
                        })
                        .then(() => {
                            enqueueSnackbar('Flow deleted.', {
                                variant: 'success',
                            });
                        })
                        .catch(() =>
                            enqueueSnackbar('Could not delete flow.', {
                                variant: 'error',
                            }),
                        );
                }}
            />
        </>
    );
};
