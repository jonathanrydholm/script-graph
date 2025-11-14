import { NodeConfigStringField, SGNode } from '@script_graph/core';
import { spawn } from 'child_process';

export const YarnInstall: SGNode = {
    name: 'Yarn Install',
    type: 'yarn_install',
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
                field: 'path',
                type: 'path',
                required: true,
                inherit: {
                    type: 'project',
                    variable: 'PATH',
                },
            },
            {
                field: 'flags',
                type: 'options',
                options: [
                    {
                        label: 'Frozen lockfile',
                        selected: false,
                        value: 'frozen_lockfile',
                    },
                ],
            },
        ],
    },
    execute: async (_, config, context) => {
        const path = config.fields.find(
            ({ field, type }) => field === 'path' && type === 'path',
        ) as NodeConfigStringField | undefined;

        if (!path?.value) {
            throw new Error('Path where to run must be configured');
        }

        try {
            await new Promise<void>((resolve, reject) => {
                const child = spawn('yarn', ['install'], {
                    cwd: path.value,
                });

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
            console.log('Something went wrong', e);
            throw e;
        }

        console.log('Finished Running yarn install');

        return [
            {
                type: 'void',
            },
        ];
    },
};
