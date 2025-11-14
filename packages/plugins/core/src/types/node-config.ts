export type NodeConfigProjectInheritance = {
    type: 'project';
    variable: 'PATH';
};

export type NodeConfigStringField = {
    field: string;
    type: 'string';
    required?: boolean;
    value?: string;
};

export type NodeConfigPathField = {
    field: string;
    type: 'path';
    required?: boolean;
    value?: string;
    inherit?: NodeConfigProjectInheritance;
};

export type NodeConfigOptionsField = {
    field: string;
    type: 'options';
    options: { label: string; value: string; selected: boolean }[];
    required?: boolean;
};

export type NodeConfigField =
    | NodeConfigStringField
    | NodeConfigOptionsField
    | NodeConfigPathField;

export type NodeConfig = {
    fields: NodeConfigField[];
};
