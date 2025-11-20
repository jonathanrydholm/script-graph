import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
} from '@mui/material';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import type { ProjectConfig } from '@script_graph/general-types';

interface INewFlowDialog {
    project: ProjectConfig | null;
    onClose: () => void;
}

const NewFlowDialog = ({ onClose, project }: INewFlowDialog) => {
    const { enqueueSnackbar } = useSnackbar();

    const [name, setName] = useState<string>('');

    return (
        <Dialog
            open={project !== null}
            onClose={onClose}
            maxWidth={'lg'}
            fullWidth
            disableScrollLock
        >
            <DialogTitle>New flow</DialogTitle>
            <DialogContent
                sx={{
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Stack
                    gap={2}
                    sx={{
                        flex: 1,
                        height: '100%',
                        overflow: 'hidden',
                    }}
                >
                    <Stack flex={1} overflow="auto" gap={1}>
                        <Box
                            display="grid"
                            gridTemplateColumns="repeat(2, 1fr)"
                            gap={2}
                            mt={1}
                        >
                            <TextField
                                fullWidth
                                label={'Flow name'}
                                type="text"
                                variant="outlined"
                                value={name}
                                required
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Box>
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>CANCEL</Button>
                <Button
                    disabled={!name || !project}
                    onClick={() => {
                        if (project) {
                            window.api
                                .updateProject({
                                    ...project,
                                    flows: [
                                        ...project.flows,
                                        {
                                            id: crypto.randomUUID(),
                                            edges: [],
                                            name,
                                            nodes: [
                                                {
                                                    id: crypto.randomUUID(),
                                                    config: { fields: [] },
                                                    graphics: {
                                                        h: 0,
                                                        w: 0,
                                                        x: 0,
                                                        y: 0,
                                                    },
                                                    inputs: [],
                                                    outputs: [
                                                        {
                                                            type: 'void',
                                                        },
                                                    ],
                                                    name: 'Entrypoint',
                                                    type: 'entrypoint',
                                                    tags: [],
                                                },
                                            ],
                                            metaNodes: [],
                                        },
                                    ],
                                })
                                .then(() => {
                                    enqueueSnackbar('Flow created!', {
                                        variant: 'success',
                                    });
                                })
                                .catch(() =>
                                    enqueueSnackbar('Could not create flow.', {
                                        variant: 'error',
                                    }),
                                )
                                .finally(onClose);
                        }
                    }}
                    variant="contained"
                >
                    SAVE
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NewFlowDialog;
