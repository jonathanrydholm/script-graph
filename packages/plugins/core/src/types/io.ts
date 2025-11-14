export type BooleanIO = {
    type: 'boolean'
}

export type StringIO = {
    type: 'string'
}

export type VoidIO = {
    type: 'void'
}

export type NumberIO = {
    type: 'number'
}

export type IO = BooleanIO | StringIO | VoidIO | NumberIO