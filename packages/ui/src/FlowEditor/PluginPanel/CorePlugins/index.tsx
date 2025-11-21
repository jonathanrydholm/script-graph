import { IconButton, Stack, Tooltip } from '@mui/material';
import type { SerializedPlugin } from '@script_graph/general-types';
import type { SGNode } from '@script_graph/plugin-types';
import { Repeat } from 'lucide-react';
import { useMemo } from 'react';

interface ICorePluginsPanel {
    plugins: SerializedPlugin[];
}

export const CorePluginsPanel = ({ plugins }: ICorePluginsPanel) => {
    const nodes = useMemo(() => {
        return plugins.flatMap((plugin) => plugin.nodes);
    }, [plugins]);

    return (
        <Stack
            width="50px"
            sx={{
                backgroundColor: '#202228',
                borderRadius: '4px',
                boxShadow: '0 -2px 8px 0 rgba(0, 0, 0, 0.5)',
            }}
        >
            {nodes.map((node) => (
                <Tooltip title={node.name} key={node.type}>
                    <IconButton
                        draggable
                        onDragStart={(e) => {
                            e.stopPropagation();
                            e.dataTransfer.setData(
                                'script_graph/blueprint',
                                JSON.stringify(node),
                            );
                        }}
                    >
                        <Repeat color="#AFAFB1" />
                    </IconButton>
                </Tooltip>
            ))}
        </Stack>
    );
};
