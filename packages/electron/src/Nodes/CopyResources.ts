import { NodeConfigStringField, SGNode } from '@script-graph/core';
import { spawn } from 'child_process';

export const CopyResources: SGNode = {
    name: 'Copy resources',
    type: 'copy_resources',
    inputs: [
        {
            type: 'void',
        },
    ],
    outputs: [
        {
            type: 'void',
        },
    ],
    config: {
        fields: [
            {
                field: 'from',
                type: 'path',
                required: true,
            },
            {
                field: 'to',
                type: 'path',
                required: true,
            },
            {
                field: 'flags',
                type: 'options',
                options: [
                    {
                        label: 'Recursive',
                        selected: false,
                        value: 'recursive',
                    },
                ],
            },
        ],
    },
    execute: async (_, config, context) => {
        const from = config.fields.find(
            ({ field, type }) => field === 'from' && type === 'path',
        ) as NodeConfigStringField | undefined;

        const to = config.fields.find(
            ({ field, type }) => field === 'to' && type === 'path',
        ) as NodeConfigStringField | undefined;

        if (!from?.value || !to?.value) {
            throw new Error('From and to paths are required');
        }

        try {
            const args: string[] = [];

            if (
                config.fields.some(
                    (field) =>
                        field.type === 'options' &&
                        field.field === 'flags' &&
                        field.options.some(
                            (opt) => opt.value === 'recursive' && opt.selected,
                        ),
                )
            ) {
                args.push('-a');
            }

            args.push(`${from.value}/.`);
            args.push(`${to.value}/.`);

            context.streamLog({
                level: 'info',
                msg: `Copying ${from.value} to ${to.value}`,
                nodeId: context.serializedNode.id,
            });

            await new Promise<void>((resolve, reject) => {
                const child = spawn('cp', [...args], {});

                child.on('error', (err) => {
                    context.streamLog({
                        level: 'error',
                        msg: err.message,
                        nodeId: context.serializedNode.id,
                    });
                });

                child.stdout.on('data', (data) => {
                    context.streamLog({
                        level: 'info',
                        msg: data.toString(),
                        nodeId: context.serializedNode.id,
                    });
                });

                child.stderr.on('data', (data) => {
                    context.streamLog({
                        level: 'error',
                        msg: data.toString(),
                        nodeId: context.serializedNode.id,
                    });
                });

                child.on('close', (code) => {
                    context.streamLog({
                        level: 'info',
                        msg: `Process exited with code ${code}`,
                        nodeId: context.serializedNode.id,
                    });
                    if (code === 0 || code === null) {
                        resolve();
                    } else {
                        reject();
                    }
                });
            });
        } catch (e) {
            context.streamLog({
                level: 'error',
                msg: `Could not copy ${from.value} to ${to.value}`,
                nodeId: context.serializedNode.id,
            });
            throw e;
        }

        return [
            {
                type: 'void',
            },
        ];
    },
};
