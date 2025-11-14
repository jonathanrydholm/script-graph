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
import { useContext, useState } from 'react';
import { StoreContext } from '../../Providers/Store';
import { useSnackbar } from 'notistack';

interface INewFlowDialog {
    open: boolean;
    onClose: () => void;
}

const NewFlowDialog = ({ onClose, open }: INewFlowDialog) => {
    const { enqueueSnackbar } = useSnackbar();

    const { store, setStore } = useContext(StoreContext);

    const [name, setName] = useState<string>('');

    return (
        <Dialog
            open={open}
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
                    disabled={!name || !store.selectedProject}
                    onClick={() => {
                        if (store.selectedProject) {
                            window.api
                                .updateProject({
                                    ...store.selectedProject,
                                    flows: [
                                        ...store.selectedProject.flows,
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
                                                    name: 'Trigger',
                                                    type: 'trigger',
                                                },
                                            ],
                                        },
                                    ],
                                })
                                .then((updatedProject) =>
                                    setStore((prev) => ({
                                        ...prev,
                                        selectedProject: updatedProject,
                                    })),
                                )
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
