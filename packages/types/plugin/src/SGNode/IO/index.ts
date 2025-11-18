import { BooleanIO } from './BooleanIO';
import { NumberIO } from './NumberIO';
import { StringIO } from './StringIO';
import { VoidIO } from './VoidIO';

export type IO = BooleanIO | StringIO | VoidIO | NumberIO;

export * from './BooleanIO';
export * from './NumberIO';
export * from './StringIO';
export * from './VoidIO';
