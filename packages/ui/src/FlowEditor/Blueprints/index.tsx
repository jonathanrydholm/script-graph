import { Store, Blocks, HardDrive } from 'lucide-react';
import { IconButton, List, Stack, TextField, Tooltip } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { SerializedPlugin } from '@script_graph/general-types';
import PluginListItem from './PluginListItem';

interface IBlueprints {
    onPluginsModified: () => void;
}

const Blueprints = ({ onPluginsModified }: IBlueprints) => {
    const [plugins, setPlugins] = useState<SerializedPlugin[]>([]);

    const [view, setView] = useState<
        'installed-plugins' | 'marketplace' | 'custom-plugins'
    >('installed-plugins');

    useEffect(() => {
        window.api.getRegisteredPlugins().then(setPlugins);
        window.api.onPluginsModified((serializedPlugins) => {
            setPlugins(JSON.parse(serializedPlugins) as SerializedPlugin[]);
            onPluginsModified();
        });
    }, []);

    const renderedList = useMemo(() => {
        return plugins.map((plugin) => <PluginListItem plugin={plugin} />);
    }, [plugins]);

    const renderedTabs = useMemo(() => {
        return (
            <Stack direction="row">
                <Tooltip title="Installed Plugins">
                    <IconButton>
                        <HardDrive
                            color={
                                view === 'installed-plugins'
                                    ? '#FFE599'
                                    : '#AFAFB1'
                            }
                        />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Marketplace">
                    <IconButton>
                        <Store
                            color={
                                view === 'marketplace' ? '#FFE599' : '#AFAFB1'
                            }
                        />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Custom Plugins">
                    <IconButton>
                        <Blocks
                            color={
                                view === 'custom-plugins'
                                    ? '#FFE599'
                                    : '#AFAFB1'
                            }
                        />
                    </IconButton>
                </Tooltip>
            </Stack>
        );
    }, [view]);

    return (
        <Stack flex={1} gap={1}>
            {renderedTabs}
            <TextField
                fullWidth
                label={'Search'}
                type="text"
                variant="outlined"
                size="small"
                placeholder="Search for nodes"
                sx={{ paddingX: '8px' }}
                slotProps={{
                    input: {
                        sx: { color: '#fff' },
                    },
                }}
            />
            <List disablePadding>{renderedList}</List>
        </Stack>
    );
};

export default Blueprints;
