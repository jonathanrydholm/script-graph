import { Plugin, ResolvedStringIO } from '@script_graph/plugin-types';

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
            name: 'FileList',
            type: 'file_list',
            tags: [],
            inputs: [
                {
                    type: 'void',
                },
            ],
            outputs: [
                {
                    type: 'array',
                    elements: {
                        type: 'string',
                    },
                },
            ],
            config: {
                fields: [],
            },
            execute: async (io, config) => {
                return [
                    {
                        type: 'array',
                        elements: {
                            type: 'string',
                        },
                        value: [
                            {
                                type: 'string',
                                value: 'First file.pdf',
                            },
                            {
                                type: 'string',
                                value: 'Second file.txt',
                            },
                        ],
                    },
                ];
            },
        },
        {
            name: 'FileProcessor',
            type: 'file_proc',
            tags: [],
            inputs: [
                {
                    type: 'string',
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
            execute: async (io, config, context) => {
                context.streamLog({
                    level: 'warn',
                    msg: `Processing file: ${(io[0] as ResolvedStringIO).value}`,
                    nodeId: context.serializedNode.id,
                });
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
