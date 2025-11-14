import { IconButton, Stack, TextField, Tooltip } from '@mui/material';
import type { ProjectFlow } from '@script-graph/core';
import { useEffect, useState } from 'react';
import { Save, Trash } from 'lucide-react';

interface IFlowDetails {
    flow: ProjectFlow;
    onSave: (name: string) => void;
    onDelete: () => void;
}

const FlowDetails = ({ flow, onSave, onDelete }: IFlowDetails) => {
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
                <Tooltip title="Delete flow">
                    <IconButton onClick={onDelete}>
                        <Trash color="#EE6983" />
                    </IconButton>
                </Tooltip>
            </Stack>
        </Stack>
    );
};

export default FlowDetails;
