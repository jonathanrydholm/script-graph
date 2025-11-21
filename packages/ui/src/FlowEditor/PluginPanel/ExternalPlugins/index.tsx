import { List, Stack } from '@mui/material';
import type { SerializedPlugin } from '@script_graph/general-types';
import { useMemo } from 'react';
import { PluginListItem } from './PluginListItem';

interface IExternalPlugins {
    plugins: SerializedPlugin[];
}

export const ExternalPlugins = ({ plugins }: IExternalPlugins) => {
    const renderedList = useMemo(() => {
        return plugins.map((plugin) => <PluginListItem plugin={plugin} />);
    }, [plugins]);

    return (
        <Stack
            sx={{
                backgroundColor: '#202228',
                borderRadius: '4px',
                boxShadow: '0 -2px 8px 0 rgba(0, 0, 0, 0.5)',
            }}
            pb={2}
            flex={1}
        >
            <List disablePadding>{renderedList}</List>
        </Stack>
    );
};
