import {
    Box,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { useContext, useEffect, useMemo, useState } from 'react';
import { SquarePlus } from 'lucide-react';
import NewProjectDialog from './NewProjectDialog';
import ProjectListItem from './ProjectListItem';
import { StoreContext } from '../Providers/Store';
import NewFlowDialog from './NewFlowDialog';
import type { ProjectConfig } from '@script_graph/general-types';

const Projects = () => {
    const { setStore, store } = useContext(StoreContext);

    const [createOpen, setCreateOpen] = useState<boolean>(false);
    const [createFlowOpen, setCreateFlowOpen] = useState<ProjectConfig | null>(
        null,
    );

    useEffect(() => {
        const unsubscribe = window.api.subscribeToProjects(
            (stringifiedProjects) =>
                setStore((prev) => ({
                    ...prev,
                    projects: (
                        JSON.parse(stringifiedProjects) as ProjectConfig[]
                    ).sort((a, b) => a.name.localeCompare(b.name)),
                })),
        );

        return unsubscribe;
    }, []);

    const renderedList = useMemo(() => {
        return store.projects.map((project) => (
            <ProjectListItem
                key={project.id}
                project={project}
                onCreateFlow={() => setCreateFlowOpen(project)}
            />
        ));
    }, [store.projects, setCreateFlowOpen]);

    return (
        <Box height="100%">
            <List disablePadding>
                <ListItemButton onClick={() => setCreateOpen(true)}>
                    <ListItemIcon>
                        <SquarePlus color="#AFAFB1" />
                    </ListItemIcon>
                    <ListItemText
                        primary={'New'}
                        secondary={'Create a new project'}
                        sx={{ color: '#AFAFB1' }}
                    />
                </ListItemButton>
                <Divider sx={{ backgroundColor: '#191B1F' }} />
                {renderedList}
            </List>
            <NewProjectDialog
                open={createOpen}
                onCancel={() => setCreateOpen(false)}
                onSave={() => setCreateOpen(false)}
            />
            <NewFlowDialog
                project={createFlowOpen}
                onClose={() => setCreateFlowOpen(null)}
            />
        </Box>
    );
};

export default Projects;
