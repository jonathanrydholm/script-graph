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
            name: 'Trigger',
            type: 'trigger',
            tags: [],
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
        },
        {
            name: 'Sleep',
            type: 'sleep',
            tags: [],
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
                await new Promise((r) => setTimeout(r, 1000));
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
