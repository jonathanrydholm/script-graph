import {
    Box,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { useCallback, useContext, useMemo, useState } from 'react';
import { SquarePlus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { StoreContext } from '../Providers/Store';
import NewFlowDialog from './NewFlowDialog';
import { NodeLogContext } from '../Providers/NodeLogs';
import ProjectFlowListItem from './ProjectFlowListItem';
import type { ProjectFlow } from '@script_graph/core';

type SearchParams = {
    id: string;
};

const ProjectFlows = () => {
    const { store } = useContext(StoreContext);
    const { setNodeLog } = useContext(NodeLogContext);

    const { id } = useParams<SearchParams>();

    const { enqueueSnackbar } = useSnackbar();

    const navigate = useNavigate();

    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    const flows = useMemo(() => {
        if (store.selectedProject) {
            return store.selectedProject.flows;
        }
        return [];
    }, [store.selectedProject]);

    const runFlow = useCallback(
        async (flow: ProjectFlow) => {
            if (!store.selectedProject) {
                return;
            }
            setNodeLog((prev) => ({
                ...prev,
                drawerOpen: false,
                logsById: {},
                statusById: {},
                nodeFilter: undefined,
            }));

            try {
                await window.api.runManualFlow(
                    store.selectedProject.path,
                    flow.id,
                );
                enqueueSnackbar('Succesfull run!', { variant: 'success' });
            } catch (e) {
                enqueueSnackbar(`Something went wrong. ${e}`, {
                    variant: 'error',
                });
            }
        },
        [enqueueSnackbar, store, setNodeLog],
    );

    const navigateToFlow = useCallback(
        (flow: ProjectFlow) => {
            navigate(`/flow/${flow.id}`);
        },
        [navigate],
    );

    const renderedList = useMemo(() => {
        return flows.map((flow) => (
            <ProjectFlowListItem
                key={flow.id}
                flow={flow}
                onExecute={runFlow}
                onNavigate={navigateToFlow}
                selected={flow.id === id}
            />
        ));
    }, [id, flows, navigateToFlow, runFlow]);

    return (
        <Box height="100%">
            <List disablePadding>
                <ListItemButton onClick={() => setDialogOpen(true)}>
                    <ListItemIcon>
                        <SquarePlus color="#AFAFB1" />
                    </ListItemIcon>
                    <ListItemText
                        primary={'New'}
                        secondary={'Create a new flow'}
                        sx={{ color: '#AFAFB1' }}
                    />
                </ListItemButton>
                <Divider sx={{ backgroundColor: '#191B1F' }} />
                {renderedList}
            </List>
            <NewFlowDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
            />
        </Box>
    );
};

export default ProjectFlows;
