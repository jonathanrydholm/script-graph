import type { ProjectReference } from '@script_graph/core';
import {
    Box,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SquarePlus, FolderRoot } from 'lucide-react';
import { StoreContext } from '../Providers/Store';
import NewProjectDialog from './NewProjectDialog';

const Projects = () => {
    const { setStore, store } = useContext(StoreContext);

    const [projects, setProjects] = useState<ProjectReference[]>([]);

    const [createOpen, setCreateOpen] = useState<boolean>(false);

    const onSelectProject = useCallback(
        (reference: ProjectReference) => {
            window.api.getProject(reference.path).then((project) => {
                if (project) {
                    setStore((prev) => ({ ...prev, selectedProject: project }));
                }
            });
        },
        [setStore],
    );

    useEffect(() => {
        window.api.getProjectReferences().then(setProjects);
    }, []);

    useEffect(() => {
        if (projects.length > 0) {
            onSelectProject(projects[0]);
        }
    }, [onSelectProject, projects]);

    const renderedList = useMemo(() => {
        return projects.map((project) => (
            <ListItem key={project.path} disablePadding>
                <ListItemButton
                    onClick={() => onSelectProject(project)}
                    sx={{
                        backgroundColor:
                            store.selectedProject?.path === project.path
                                ? '#313339'
                                : undefined,
                    }}
                >
                    <ListItemIcon>
                        <FolderRoot
                            color={
                                store.selectedProject?.path === project.path
                                    ? '#FFE599'
                                    : '#AFAFB1'
                            }
                        />
                    </ListItemIcon>
                    <ListItemText
                        primary={project.name}
                        sx={{ color: '#AFAFB1' }}
                    />
                </ListItemButton>
            </ListItem>
        ));
    }, [projects, store.selectedProject, onSelectProject]);

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
                onSave={() => {
                    window.api
                        .getProjectReferences()
                        .then(setProjects)
                        .finally(() => setCreateOpen(false));
                }}
            />
        </Box>
    );
};

export default Projects;
