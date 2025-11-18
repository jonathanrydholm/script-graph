export interface SGEdge {
    /** Id of the edge */
    id: string;
    /** SG source node id */
    source: string;
    /** Connection point id of the SG source node */
    sourceHandle: string;
    /** SG target node id */
    target: string;
    /** Connection point id of the SG target node */
    targetHandle: string;
}
