import { LoadedPlugin } from '../types';
import { ResolvedArrayIO } from '@script_graph/plugin-types';

export const corePlugin: LoadedPlugin = {
    name: 'core',
    path: '',
    version: '0.0.1',
    nodes: [
        {
            name: 'Entrypoint',
            type: 'entrypoint',
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
            config: {
                fields: [],
            },
            inputs: [
                {
                    type: 'array',
                    elements: {
                        type: 'inherit',
                    },
                },
            ],
            outputs: [
                {
                    type: 'inherit',
                },
            ],
            name: 'ForEach',
            type: 'ForEach',
            tags: [],
            execute: async (io) => {
                return [
                    {
                        type: 'array',
                        value: (io[0] as ResolvedArrayIO).value,
                    },
                ];
            },
        },
        {
            config: {
                fields: [],
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
            execute: async (io) => {
                return io;
            },
        },
        {
            config: {
                fields: [],
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
            name: 'Template',
            type: 'Template',
            tags: [],
            execute: async (io) => {
                return io;
            },
        },
    ],
};
