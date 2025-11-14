import { NodeBlueprint, SGNode } from "types";

export const SGNodeToBlueprint = (node: SGNode): NodeBlueprint => {
    return {
        inputs: node.inputs,
        name: node.name,
        outputs: node.outputs,
        type: node.type,
        config: node.config,
    }
}