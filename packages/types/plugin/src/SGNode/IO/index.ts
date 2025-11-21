import { BooleanIO } from './BooleanIO';
import { InheritIO } from './InheritIO';
import { NumberIO } from './NumberIO';
import { StringIO } from './StringIO';
import { VoidIO } from './VoidIO';

export type ArrayIO = {
    type: 'array';
    required?: boolean;
    elements: IO;
};

export type IO = BooleanIO | StringIO | VoidIO | NumberIO | ArrayIO | InheritIO;

export * from './BooleanIO';
export * from './NumberIO';
export * from './StringIO';
export * from './VoidIO';
export * from './InheritIO';
