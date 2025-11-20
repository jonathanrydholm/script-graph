import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { Trash } from 'lucide-react';

interface IFlowListItemMenu {
    options: {
        mouseX: number;
        mouseY: number;
    } | null;
    onDelete: () => void;
    onClose: () => void;
}

export const FlowListItemMenu = ({
    options,
    onClose,
    onDelete,
}: IFlowListItemMenu) => {
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
            <MenuItem onClick={onDelete}>
                <ListItemIcon>
                    <Trash color="#EE6983" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
            </MenuItem>
        </Menu>
    );
};
