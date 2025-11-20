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

interface INewProjectDialog {
    open: boolean;
    onCancel: () => void;
    onSave: () => void;
}

const NewProjectDialog = ({ onCancel, open, onSave }: INewProjectDialog) => {
    const { enqueueSnackbar } = useSnackbar();

    const [name, setName] = useState<string>('');
    const [path, setPath] = useState<string>('');

    return (
        <Dialog
            open={open}
            onClose={onCancel}
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
                                label={'Project name'}
                                type="text"
                                variant="outlined"
                                value={name}
                                required
                                onChange={(e) => setName(e.target.value)}
                            />
                            <TextField
                                fullWidth
                                label="Project path"
                                type="text"
                                variant="outlined"
                                value={path}
                                required
                                onClick={() => {
                                    window.api
                                        .selectFolder()
                                        .then((selectedPath) => {
                                            if (selectedPath) {
                                                setPath(selectedPath);
                                            }
                                        });
                                }}
                            />
                        </Box>
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>CANCEL</Button>
                <Button
                    disabled={!name || !path}
                    onClick={() => {
                        window.api
                            .createProject({
                                name,
                                path,
                                flows: [],
                                id: crypto.randomUUID(),
                            })
                            .then(() => {
                                enqueueSnackbar('Project created!', {
                                    variant: 'success',
                                });
                            })
                            .catch(() =>
                                enqueueSnackbar('Could not create flow.', {
                                    variant: 'error',
                                }),
                            )
                            .finally(onSave);
                    }}
                    variant="contained"
                >
                    SAVE
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NewProjectDialog;
