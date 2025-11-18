import { NodeConfigProjectInheritance } from './NodeConfigProjectInheritance';

export type NodeConfigPathField = {
    field: string;
    type: 'path';
    required?: boolean;
    value?: string;
    inherit?: NodeConfigProjectInheritance;
};
