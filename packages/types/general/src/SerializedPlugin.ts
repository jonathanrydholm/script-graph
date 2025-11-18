import { Plugin, SGNode } from '@script_graph/plugin-types';

export type SerializedPlugin = Omit<Plugin, 'nodes'> & {
    name: string;
    version: string;
    nodes: Omit<SGNode, 'execute'>[];
};
