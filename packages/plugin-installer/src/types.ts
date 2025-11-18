import { Plugin } from '@script_graph/plugin-types';

export type LoadedPlugin = Plugin & {
    name: string;
    version: string;
    path: string;
};
