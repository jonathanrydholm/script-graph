import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
} from '@mui/material';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import type {
    ProjectConfig,
    ProjectFlowType,
} from '@script_graph/general-types';

interface INewFlowDialog {
    project: ProjectConfig | null;
    onClose: () => void;
}

const NewFlowDialog = ({ onClose, project }: INewFlowDialog) => {
    const { enqueueSnackbar } = useSnackbar();

    const [name, setName] = useState<string>('');
    const [flowType, setFlowType] = useState<ProjectFlowType>('executable');

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
                            <FormControl fullWidth>
                                <InputLabel id="flow-type-label">
                                    Flow Type
                                </InputLabel>
                                <Select
                                    labelId="flow-type-label"
                                    value={flowType}
                                    label="Flow Type"
                                    onChange={(e) =>
                                        setFlowType(e.target.value)
                                    }
                                >
                                    <MenuItem value={'executable'}>
                                        Executable
                                    </MenuItem>
                                    <MenuItem value={'template'}>
                                        Template
                                    </MenuItem>
                                </Select>
                            </FormControl>
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
                                            type: flowType,
                                            nodes: [
                                                flowType === 'executable'
                                                    ? {
                                                          id: crypto.randomUUID(),
                                                          config: {
                                                              fields: [],
                                                          },
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
                                                      }
                                                    : {
                                                          id: crypto.randomUUID(),
                                                          config: {
                                                              fields: [],
                                                          },
                                                          graphics: {
                                                              h: 0,
                                                              w: 0,
                                                              x: 0,
                                                              y: 0,
                                                          },
                                                          inputs: [
                                                              {
                                                                  type: 'inherit',
                                                              },
                                                          ],
                                                          outputs: [
                                                              {
                                                                  type: 'inherit',
                                                              },
                                                          ],
                                                          name: 'Input',
                                                          type: 'Input',
                                                          tags: [],
                                                      },
                                            ],
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
