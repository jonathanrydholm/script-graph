import { SGNode } from './node';

export type Plugin = {
    nodes: SGNode[];
};

export type LoadedPlugin = Plugin & {
    tags: string[];
    name: string;
};
