import {
  AvroSchema,
  RawAvroSchema,
  SchemaOptions,
  ConfluentSchema,
  Serdes,
  ConfluentSubject,
} from './@types'
import { ConfluentSchemaRegistryArgumentError } from './errors'
import avro from 'avsc'

export default class AvroSerdes implements Serdes {
  private getRawAvroSchema(schema: ConfluentSchema): RawAvroSchema {
    return JSON.parse(schema.schemaString) as RawAvroSchema
  }

  public getAvroSchema(schema: ConfluentSchema, opts?: SchemaOptions) {
    const rawSchema: RawAvroSchema = this.getRawAvroSchema(schema)
    // @ts-ignore TODO: Fix typings for Schema...
    const avroSchema: AvroSchema = avro.Type.forSchema(rawSchema, opts)
    return avroSchema
  }

  public validate(avroSchema: AvroSchema): void {
    if (!avroSchema.name) {
      throw new ConfluentSchemaRegistryArgumentError(`Invalid name: ${avroSchema.name}`)
    }
  }

  // @ts-ignore
  public getSubject(schema: ConfluentSchema, avroSchema: AvroSchema, separator: string): ConfluentSubject {
    const rawSchema: RawAvroSchema = this.getRawAvroSchema(schema)

    if (!rawSchema.namespace) {
      throw new ConfluentSchemaRegistryArgumentError(`Invalid namespace: ${rawSchema.namespace}`)
    }

    const subject: ConfluentSubject = {
      name: [rawSchema.namespace, rawSchema.name].join(separator),
    }
    return subject
  }
}
