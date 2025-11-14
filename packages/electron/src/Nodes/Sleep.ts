import { NodeConfigStringField, SGNode } from '@script_graph/core';

export const Sleep: SGNode = {
    name: 'Sleep',
    type: 'sleep',
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
                type: 'string',
                field: 'duration',
                required: true,
            },
        ],
    },
    execute: async (_, config, context) => {
        const duration = config.fields.find(
            ({ field, type }) => field === 'duration' && type === 'string',
        ) as NodeConfigStringField | undefined;

        if (duration.value === undefined) {
            throw new Error('Duration required');
        }

        if (duration.value.endsWith('ms')) {
            const resolvedDuration = parseInt(duration.value);
            context.streamLog({
                level: 'info',
                nodeId: context.serializedNode.id,
                msg: `Sleeping for ${resolvedDuration} milliseconds`,
            });
            await new Promise((resolve) =>
                setTimeout(resolve, resolvedDuration),
            );
        } else if (duration.value.endsWith('s')) {
            const resolvedDuration = parseInt(duration.value) * 1000;
            context.streamLog({
                level: 'info',
                nodeId: context.serializedNode.id,
                msg: `Sleeping for ${resolvedDuration} seconds`,
            });
            await new Promise((resolve) =>
                setTimeout(resolve, resolvedDuration),
            );
        } else {
            throw new Error('Duration not supported');
        }

        context.streamLog({
            level: 'info',
            nodeId: context.serializedNode.id,
            msg: `Done sleeping.`,
        });

        return [
            {
                type: 'void',
            },
        ];
    },
};
