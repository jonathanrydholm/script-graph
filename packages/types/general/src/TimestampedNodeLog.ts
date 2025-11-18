import { StreamedLog } from '@script_graph/plugin-types';

export type TimestampedNodeLog = StreamedLog & {
    timestamp: number;
};
