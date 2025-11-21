import { ExecutionContext } from './ExecutionContext';
import { NodeConfig } from './NodeConfig';
import { ResolvedIO } from './ResolvedIO';

export type ExecutorFn = (
    inputs: ExecuteFnIO,
    config: NodeConfig,
    context: ExecutionContext,
) => Promise<ExecuteFnIO>;

export type ExecuteFnIO = Pick<ResolvedIO, 'type' | 'value'>[];
