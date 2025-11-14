import { IO } from "./io"
import { NodeConfig } from "./node-config"
import { ResolvedIO } from "./resolved-io"

/** Static declaration of a node. Contains a description of the node and the executor. */
export type SGNode = {
    name: string
    type: string
    inputs: IO[]
    outputs: IO[]
    config: NodeConfig
    execute: ExecutorFn
}

export type LogLevel = 'info' | 'warn' | 'error'

export type StreamLogFn = (log: StreamedLog) => void

export type StreamedLog = {
    nodeId: string;
    level: LogLevel
    msg: string
}

export type NodeStatus = {
    success: boolean;
    nodeId: string;
}

export type TimestampedLog = StreamedLog & { timestamp: number }

export type ExecutionContext = {
    streamLog: StreamLogFn
    serializedNode: SerializedSGNode
}

export type ExecutorFn = (inputs: ResolvedIO[], config: NodeConfig, context: ExecutionContext) => Promise<ResolvedIO[]>;

export type SGNodeGraphics = {
    x: number;
    y: number;
    w: number;
    h: number;
}

/** Serialized version of a SGNode. Passable through the IPC. */
export type SerializedSGNode = Omit<SGNode, 'execute'> & { id: string, graphics: SGNodeGraphics };

/** Executable version of a SGNode */
export type ExecutableSGNode = SerializedSGNode & { execute: ExecutorFn }

export type NodeBlueprint = Omit<SGNode, 'execute'>;