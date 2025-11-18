import { ExecutorFn } from './ExecutorFn';
import { IO } from './IO';
import { NodeConfig } from './NodeConfig';

export type SGNode = {
    tags: string[];
    name: string;
    type: string;
    inputs: IO[];
    outputs: IO[];
    config: NodeConfig;
    execute: ExecutorFn;
};
