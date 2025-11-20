import { Plugin } from '@script_graph/plugin-types';

const plugin: Plugin = {
    nodes: [
        {
            config: {
                fields: [],
            },
            execute: async (_, __, context) => {
                context.streamLog({
                    level: 'info',
                    msg: 'Invoked git pull',
                    nodeId: context.serializedNode.id,
                });
                return [];
            },
            inputs: [
                {
                    type: 'void',
                },
            ],
            outputs: [],
            name: 'Git pull',
            tags: ['git', 'pull'],
            type: 'git-pull',
        },
        {
            name: 'Sleep',
            type: 'sleep',
            tags: [],
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
                fields: [],
            },
            execute: async () => {
                await new Promise((r) => setTimeout(r, 1000));
                return [
                    {
                        type: 'void',
                    },
                ];
            },
        },
        {
            name: 'TypedNode',
            type: 'string',
            tags: [],
            inputs: [
                {
                    type: 'string',
                    required: true,
                },
                {
                    type: 'void',
                },
                {
                    type: 'number',
                },
                {
                    type: 'boolean',
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
                        field: 'namn',
                        type: 'string',
                    },
                ],
            },
            execute: async (io, config) => {
                console.log(
                    config.fields.find(
                        (field) =>
                            field.type === 'string' && field.field === 'name',
                    ),
                );
                return [
                    {
                        type: 'void',
                    },
                ];
            },
        },
    ],
};

export default plugin;
