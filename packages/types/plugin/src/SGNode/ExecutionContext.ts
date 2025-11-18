import { SerializedSGNode } from './SerializedSGNode';
import { StreamLogFn } from './StreamLogFn';

export type ExecutionContext = {
    streamLog: StreamLogFn;
    serializedNode: SerializedSGNode;
};
