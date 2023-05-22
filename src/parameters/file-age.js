import z from 'zod'

/**
 * Plural
 */

const PluralFileAgeDurationValueSchema = z.union([
  z.literal(0),
  z.number().gt(1),
])

const PluralFileAgeDurationUnitSchema = z.union([
  z.literal('milliseconds'),
  z.literal('seconds'),
  z.literal('minutes'),
  z.literal('hours'),
  z.literal('days'),
  z.literal('weeks'),
  z.literal('months'),
  z.literal('years'),
])

const PluFileralDurationSchema = z.tuple([
  PluralFileAgeDurationValueSchema,
  PluralFileAgeDurationUnitSchema,
])

/**
 * Singular
 */

const SingularFileAgeDurationValueSchema = z.literal(1)

const SingularFileAgeDurationUnitSchema = z.union([
  z.literal('millisecond'),
  z.literal('second'),
  z.literal('minute'),
  z.literal('hour'),
  z.literal('day'),
  z.literal('week'),
  z.literal('month'),
  z.literal('year'),
])

const SinguFilelarDurationSchema = z.tuple([
  SingularFileAgeDurationValueSchema,
  SingularFileAgeDurationUnitSchema,
])

/**
 * All together now
 */

/**
 * @typedef {z.infer<typeof SingularFileAgeDurationUnitSchema>} SingularFileAgeDurationUnit
 * @typedef {z.infer<typeof PluralFileAgeDurationUnitSchema>} PluralFileAgeDurationUnit
 * @typedef {SingularFileAgeDurationUnit | PluralFileAgeDurationUnit} FileAgeDurationUnit
 * @typedef {z.infer<typeof fileAgeDuration>} LocalFileAgeDuration
 */

export const fileAgeDuration = z.union([
  PluFileralDurationSchema,
  SinguFilelarDurationSchema,
])
