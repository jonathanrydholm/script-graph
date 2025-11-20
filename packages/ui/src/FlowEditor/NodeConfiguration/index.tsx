import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    Stack,
    TextField,
} from '@mui/material';

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type Dispatch,
    type SetStateAction,
} from 'react';
import type { Node } from '@xyflow/react';
import type {
    NodeConfigField,
    SerializedSGNode,
} from '@script_graph/plugin-types';

interface INodeConfiguration {
    blueprint: Node<SerializedSGNode> | null;
    onCancel: () => void;
    onSave: (blueprint: Node<SerializedSGNode>) => void;
}

const NodeConfiguration = ({
    onCancel,
    blueprint,
    onSave,
}: INodeConfiguration) => {
    const [configurationFields, setConfigurationFields] = useState<
        NodeConfigField[]
    >([]);

    useEffect(() => {
        if (blueprint) {
            setConfigurationFields(blueprint.data.config.fields);
        } else {
            setConfigurationFields([]);
        }
    }, [blueprint]);

    const mapField = useCallback(
        (
            field: NodeConfigField,
            setState: Dispatch<SetStateAction<NodeConfigField[]>>,
            index: number,
        ) => {
            switch (field.type) {
                case 'path': {
                    return (
                        <Box key={field.field}>
                            <TextField
                                fullWidth
                                label={field.field}
                                type="text"
                                variant="outlined"
                                value={field.value || ''}
                                required={field.required}
                                onClick={() => {
                                    window.api
                                        .selectFolder()
                                        .then((selectedPath) => {
                                            if (selectedPath) {
                                                setState((prev) => {
                                                    return prev.map((p, i) => {
                                                        if (i === index) {
                                                            return {
                                                                ...p,
                                                                value: selectedPath,
                                                            };
                                                        }
                                                        return p;
                                                    });
                                                });
                                            }
                                        });
                                }}
                            />
                        </Box>
                    );
                }
                case 'string': {
                    return (
                        <Box key={field.field}>
                            <TextField
                                fullWidth
                                label={field.field}
                                type="text"
                                variant="outlined"
                                value={field.value || ''}
                                onChange={(e) =>
                                    setState((prev) => {
                                        return prev.map((p, i) => {
                                            if (i === index) {
                                                return {
                                                    ...p,
                                                    value: e.target.value,
                                                };
                                            }
                                            return p;
                                        });
                                    })
                                }
                                required={field.required}
                            />
                        </Box>
                    );
                }
                case 'options': {
                    const selectedOptions = field.options.filter(
                        (opt) => opt.selected,
                    );
                    return (
                        <FormControl key={field.field}>
                            <InputLabel id={field.field}>
                                {field.field}
                            </InputLabel>
                            <Select
                                labelId={field.field}
                                multiple
                                fullWidth
                                value={selectedOptions.map((opt) => opt.value)}
                                onChange={(event) => {
                                    const {
                                        target: { value },
                                    } = event;

                                    const allSelected =
                                        typeof value === 'string'
                                            ? value.split(',')
                                            : value;

                                    setState((prev) => {
                                        return prev.map((p, i) => {
                                            if (i === index) {
                                                return {
                                                    ...p,
                                                    options: field.options.map(
                                                        (option) => {
                                                            return {
                                                                ...option,
                                                                selected:
                                                                    allSelected.includes(
                                                                        option.value,
                                                                    ),
                                                            };
                                                        },
                                                    ),
                                                };
                                            }
                                            return p;
                                        });
                                    });
                                }}
                                input={<OutlinedInput label={field.field} />}
                                renderValue={() =>
                                    selectedOptions
                                        .map((opt) => opt.label)
                                        .join(', ')
                                }
                            >
                                {field.options.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        <Checkbox checked={opt.selected} />
                                        <ListItemText primary={opt.label} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    );
                }
            }
        },
        [],
    );

    const renderedConfigurationFields = useMemo(() => {
        return configurationFields.map((field, index) =>
            mapField(field, setConfigurationFields, index),
        );
    }, [setConfigurationFields, configurationFields, mapField]);

    const saveDisabled = useMemo(() => {
        return configurationFields.some((field) => {
            if (field.required) {
                if (field.type === 'options') {
                    return !field.options.some((opt) => opt.selected);
                }
                return field.value === undefined;
            }
            return false;
        });
    }, [configurationFields]);

    return (
        <Dialog
            open={configurationFields.length > 0}
            onClose={onCancel}
            maxWidth={'lg'}
            fullWidth
            disableScrollLock
        >
            <DialogTitle>Configure node</DialogTitle>
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
                            {renderedConfigurationFields}
                        </Box>
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>CANCEL</Button>
                <Button
                    disabled={saveDisabled}
                    onClick={() => {
                        if (blueprint) {
                            onSave({
                                ...blueprint,
                                data: {
                                    ...blueprint.data,
                                    config: {
                                        ...blueprint.data.config,
                                        fields: configurationFields,
                                    },
                                },
                            });
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

export default NodeConfiguration;
