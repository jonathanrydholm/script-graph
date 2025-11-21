import { SGNode } from './SGNode';
import { SGNodeGraphics } from './SGNodeGraphics';

export type SerializedSGNode = Omit<SGNode, 'execute'> & {
    id: string;
    parentId?: string;
    graphics: SGNodeGraphics;
};
