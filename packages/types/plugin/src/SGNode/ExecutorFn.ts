import { ExecutionContext } from './ExecutionContext';
import { NodeConfig } from './NodeConfig';
import { ResolvedIO } from './ResolvedIO';

export type ExecutorFn = (
    inputs: ResolvedIO[],
    config: NodeConfig,
    context: ExecutionContext,
) => Promise<ResolvedIO[]>;
