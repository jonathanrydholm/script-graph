import { SGNode } from '@script_graph/core';

export const Trigger: SGNode = {
    name: 'Trigger',
    type: 'trigger',
    inputs: [],
    outputs: [
        {
            type: 'void',
        },
    ],
    config: {
        fields: [],
    },
    execute: async () => {
        return [
            {
                type: 'void',
            },
        ];
    },
};
