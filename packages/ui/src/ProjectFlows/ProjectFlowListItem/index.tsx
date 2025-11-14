import {
    CircularProgress,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from '@mui/material';
import type { ProjectFlow } from '@script-graph/core';
import { Play, Workflow } from 'lucide-react';
import { useCallback, useState } from 'react';

interface IProjectFlowListItem {
    flow: ProjectFlow;
    selected: boolean;
    onExecute: (flow: ProjectFlow) => Promise<void>;
    onNavigate: (flow: ProjectFlow) => void;
}

const ProjectFlowListItem = ({
    flow,
    selected,
    onExecute,
    onNavigate,
}: IProjectFlowListItem) => {
    const [loading, setLoading] = useState(false);

    const executeFlow = useCallback(async () => {
        setLoading(true);
        await onExecute(flow);
        setLoading(false);
    }, [flow]);

    return (
        <ListItem
            key={flow.id}
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
            disablePadding
        >
            <ListItemButton
                onClick={() => onNavigate(flow)}
                sx={{
                    backgroundColor: selected ? '#313339' : undefined,
                }}
            >
                <ListItemIcon>
                    <Workflow color={selected ? '#FFE599' : '#AFAFB1'} />
                </ListItemIcon>
                <ListItemText
                    primary={flow.name}
                    sx={{ color: selected ? '#FFE599' : '#AFAFB1' }}
                />
            </ListItemButton>
        </ListItem>
    );
};

export default ProjectFlowListItem;
