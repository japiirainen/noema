import { ValidationContext } from "./ValidationContext.js"
import { ParseError } from "./ParseError.js"
import { Result } from "./Result.js"
import { Metadata, SimpleMetadata } from "./Metadata.js"
import { identity } from "./utils.js"

export interface Codec<I, T = I, M extends Metadata = Metadata> {
  decode(value: unknown): Result<T>
  encode(value: T): I
  metadata: M
  unsafeDecode(value: unknown): T
  validate(value: unknown, context: ValidationContext): Result<T>
}

export type InputOf<C extends AnyCodec> = C extends Codec<infer I> ? I : never
export type TypeOf<C extends AnyCodec> = C extends Codec<any, infer T>
  ? T
  : never

export type AnyCodec = Codec<any>
export type SimpleCodec<T, M extends SimpleMetadata = SimpleMetadata> = Codec<
  T,
  T,
  M
>
export type AnySimpleCodec = SimpleCodec<any>

export function createCodec<I, T>(
  validate: (value: unknown, context: ValidationContext) => Result<T>,
  encode: (value: T) => I
): Codec<I, T>
export function createCodec<I, T, M extends Metadata>(
  validate: (value: unknown, context: ValidationContext) => Result<T>,
  encode: (value: T) => I,
  metadata: M
): Codec<I, T, M>
export function createCodec<I, T>(
  validate: (value: unknown, context: ValidationContext) => Result<T>,
  encode: (value: T) => I,
  metadata: Metadata = { tag: "unknown", simple: false }
): Codec<I, T> {
  const decode = (value: unknown) => validate(value, new ValidationContext(""))
  const unsafeDecode = (value: unknown) => {
    const result = decode(value)
    if (result.ok) return result.value
    else throw new ParseError("", result.issues)
  }
  return {
    decode,
    encode,
    metadata,
    unsafeDecode,
    validate,
  }
}

export function createSimpleCodec<T>(
  validate: (value: unknown, context: ValidationContext) => Result<T>
): SimpleCodec<T>
export function createSimpleCodec<T, M extends SimpleMetadata>(
  validate: (value: unknown, context: ValidationContext) => Result<T>,
  metadata: M
): SimpleCodec<T, M>
export function createSimpleCodec<T>(
  validate: (value: unknown, context: ValidationContext) => Result<T>,
  metadata: SimpleMetadata = { tag: "unknown", simple: true }
): SimpleCodec<T> {
  return createCodec(validate, identity, metadata)
}
