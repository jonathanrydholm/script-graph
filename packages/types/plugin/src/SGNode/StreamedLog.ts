import { LogLevel } from './LogLevel';

export type StreamedLog = {
    nodeId: string;
    level: LogLevel;
    msg: string;
};
