import { LoadedPlugin } from '../types';

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
    ],
};
