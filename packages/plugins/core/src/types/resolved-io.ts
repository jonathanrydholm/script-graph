import { BooleanIO, NumberIO, StringIO, VoidIO } from "./io"

type ResolvedBooleanIO = {
    value: boolean
} & BooleanIO

type ResolvedStringIO = {
    value: string
} & StringIO

type ResolvedVoidIO = VoidIO

type ResolvedNumberIO = {
    value: number
} & NumberIO

export type ResolvedIO = ResolvedBooleanIO | ResolvedStringIO | ResolvedVoidIO | ResolvedNumberIO