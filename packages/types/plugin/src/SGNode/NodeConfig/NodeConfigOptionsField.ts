export type NodeConfigOptionsField = {
    field: string;
    type: 'options';
    options: { label: string; value: string; selected: boolean }[];
    required?: boolean;
};
