import { NodeConfigOptionsField } from './NodeConfigOptionsField';
import { NodeConfigPathField } from './NodeConfigPathField';
import { NodeConfigStringField } from './NodeConfigStringField';

export type NodeConfigField =
    | NodeConfigStringField
    | NodeConfigOptionsField
    | NodeConfigPathField;
