import { ArrayIO } from 'SGNode/IO';
import { ResolvedBooleanIO } from './ResolvedBooleanIO';
import { ResolvedNumberIO } from './ResolvedNumberIO';
import { ResolvedStringIO } from './ResolvedStringIO';
import { ResolvedVoidIO } from './ResolvedVoidIO';
import { ResolvedInheritIO } from './ResolvedInheritIO';

export type ResolvedArrayIO = {
    value: ResolvedIO[];
} & ArrayIO;

export type ResolvedIO =
    | ResolvedBooleanIO
    | ResolvedStringIO
    | ResolvedVoidIO
    | ResolvedNumberIO
    | ResolvedArrayIO
    | ResolvedInheritIO;

export * from './ResolvedBooleanIO';
export * from './ResolvedNumberIO';
export * from './ResolvedStringIO';
export * from './ResolvedVoidIO';
export * from './ResolvedInheritIO';
