import { IconButton, Stack, TextField, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import type { ProjectFlow } from '@script_graph/general-types';

interface IFlowDetails {
    flow: ProjectFlow;
    onSave: (name: string) => void;
}

const FlowDetails = ({ flow, onSave }: IFlowDetails) => {
    const [name, setName] = useState(flow.name);

    useEffect(() => {
        setName(flow.name);
    }, [flow]);

    return (
        <Stack padding={2} gap={2}>
            <TextField
                fullWidth
                label={'Flow name'}
                type="text"
                variant="standard"
                value={name}
                size="small"
                slotProps={{
                    input: {
                        sx: { color: '#fff' },
                    },
                }}
                onChange={(e) => setName(e.target.value)}
            />
            <Stack direction="row" justifyContent="space-between">
                <Tooltip title="Save flow" onClick={() => onSave(name)}>
                    <IconButton>
                        <Save color="#FFE599" />
                    </IconButton>
                </Tooltip>
            </Stack>
        </Stack>
    );
};

export default FlowDetails;
