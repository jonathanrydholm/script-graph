import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { CirclePlus, Trash } from 'lucide-react';

interface IProjectListItemMenu {
    options: {
        mouseX: number;
        mouseY: number;
    } | null;
    onCreateFlow: () => void;
    onDeleteProject: () => void;
    onClose: () => void;
}

export const ProjectListItemMenu = ({
    options,
    onCreateFlow,
    onClose,
    onDeleteProject,
}: IProjectListItemMenu) => {
    return (
        <Menu
            open={options !== null}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={
                options !== null
                    ? { top: options.mouseY, left: options.mouseX }
                    : undefined
            }
        >
            <MenuItem onClick={onCreateFlow}>
                <ListItemIcon>
                    <CirclePlus color="#AFAFB1" />
                </ListItemIcon>
                <ListItemText>Create flow</ListItemText>
            </MenuItem>
            <MenuItem onClick={onDeleteProject}>
                <ListItemIcon>
                    <Trash color="#EE6983" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
            </MenuItem>
        </Menu>
    );
};
