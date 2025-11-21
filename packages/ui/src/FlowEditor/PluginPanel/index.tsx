import { Stack } from '@mui/material';
import { CorePluginsPanel } from './CorePlugins';
import { ExternalPlugins } from './ExternalPlugins';
import { useEffect, useMemo, useState } from 'react';
import type { SerializedPlugin } from '@script_graph/general-types';

export const PluginPanel = () => {
    const [plugins, setPlugins] = useState<SerializedPlugin[]>([]);

    useEffect(() => {
        window.api.subscribeToPlugins((serializedPlugins) => {
            setPlugins(JSON.parse(serializedPlugins) as SerializedPlugin[]);
        });
    }, []);

    const { core, external } = useMemo(() => {
        return {
            core: plugins.filter((plugin) => plugin.name === 'core'),
            external: plugins.filter((plugin) => plugin.name !== 'core'),
        };
    }, [plugins]);

    return (
        <Stack width="300px" direction="row" gap={1}>
            <CorePluginsPanel plugins={core} />
            <ExternalPlugins plugins={external} />
        </Stack>
    );
};
