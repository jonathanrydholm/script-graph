import {
    Badge,
    Collapse,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import type { SerializedPlugin } from '@script_graph/general-types';
import { Package, PackageOpen } from 'lucide-react';
import { useState } from 'react';

interface IPluginListItem {
    plugin: SerializedPlugin;
}

const PluginListItem = ({ plugin }: IPluginListItem) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <ListItemButton onClick={() => setOpen(!open)}>
                <ListItemIcon>
                    <Badge badgeContent={plugin.nodes.length} color="primary">
                        {open ? (
                            <PackageOpen color="#AFAFB1" />
                        ) : (
                            <Package color="#AFAFB1" />
                        )}
                    </Badge>
                </ListItemIcon>
                <ListItemText
                    primary={plugin.name}
                    secondary={plugin.version}
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
                    {plugin.nodes.map((node) => (
                        <ListItemButton
                            sx={{ pl: 4 }}
                            key={node.type}
                            draggable
                            onDragStart={(e) => {
                                e.stopPropagation();
                                e.dataTransfer.setData(
                                    'application/json',
                                    JSON.stringify(node),
                                );
                            }}
                        >
                            <ListItemText
                                primary={node.name}
                                sx={{ color: '#AFAFB1' }}
                            />
                        </ListItemButton>
                    ))}
                </List>
            </Collapse>
        </>
    );
};

export default PluginListItem;
