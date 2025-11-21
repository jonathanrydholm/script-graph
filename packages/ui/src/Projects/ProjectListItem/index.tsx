import {
    Badge,
    Collapse,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import type { ProjectConfig } from '@script_graph/general-types';
import { FolderClosed, FolderOpen } from 'lucide-react';
import { useCallback, useState } from 'react';
import { FlowListItem } from './FlowListItem';
import { ProjectListItemMenu } from './ContextMenu';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router-dom';

interface IProjectListItem {
    project: ProjectConfig;
    onCreateFlow: () => void;
}

type SearchParams = {
    projectId: string;
};

const ProjectListItem = ({ project, onCreateFlow }: IProjectListItem) => {
    const { projectId } = useParams<SearchParams>();
    const { enqueueSnackbar } = useSnackbar();
    const [open, setOpen] = useState(false);
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

    return (
        <>
            <ListItemButton
                onClick={() => setOpen(!open)}
                onContextMenu={handleContextMenu}
                sx={{
                    backgroundColor:
                        projectId === project.id ? '#313339' : undefined,
                }}
            >
                <ListItemIcon>
                    <Badge badgeContent={project.flows.length} color="primary">
                        {open ? (
                            <FolderOpen color="#AFAFB1" />
                        ) : (
                            <FolderClosed color="#AFAFB1" />
                        )}
                    </Badge>
                </ListItemIcon>
                <ListItemText
                    primary={project.name}
                    sx={{ color: '#AFAFB1' }}
                />
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List
                    component="div"
                    disablePadding
                    sx={{
                        boxShadow: 'inset -2px 0 8px 0 rgba(0, 0, 0, 0.5)',
                    }}
                >
                    {project.flows.map((flow) => (
                        <FlowListItem
                            flow={flow}
                            project={project}
                            key={flow.id}
                        />
                    ))}
                </List>
            </Collapse>
            <ProjectListItemMenu
                options={contextMenu}
                onClose={() => setContextMenu(null)}
                onCreateFlow={() => {
                    onCreateFlow();
                    setContextMenu(null);
                }}
                onDeleteProject={() => {
                    window.api
                        .deleteProject(project)
                        .then(() =>
                            enqueueSnackbar('Deleted project', {
                                variant: 'success',
                            }),
                        )
                        .catch((e) =>
                            enqueueSnackbar('Could not delete project.', {
                                variant: 'error',
                            }),
                        );
                }}
            />
        </>
    );
};

export default ProjectListItem;
