import { ResolvedBooleanIO } from './ResolvedBooleanIO';
import { ResolvedNumberIO } from './ResolvedNumberIO';
import { ResolvedStringIO } from './ResolvedStringIO';
import { ResolvedVoidIO } from './ResolvedVoidIO';

export type ResolvedIO =
    | ResolvedBooleanIO
    | ResolvedStringIO
    | ResolvedVoidIO
    | ResolvedNumberIO;
