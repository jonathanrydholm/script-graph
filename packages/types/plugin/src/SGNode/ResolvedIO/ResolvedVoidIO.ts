import { VoidIO } from '../IO';

export type ResolvedVoidIO = VoidIO & {
    value?: never;
};
