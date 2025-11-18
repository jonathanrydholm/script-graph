import { NodeConfigField } from './NodeConfigField';

export type NodeConfig = {
    fields: NodeConfigField[];
};

export * from './NodeConfigField';
export * from './NodeConfigOptionsField';
export * from './NodeConfigPathField';
export * from './NodeConfigProjectInheritance';
export * from './NodeConfigStringField';
