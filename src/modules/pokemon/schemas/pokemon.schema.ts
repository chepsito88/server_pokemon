import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema()
export class Pokemon {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  name: string;
  @Prop()
  description: string;
}

export const pokemonSchema = SchemaFactory.createForClass(Pokemon);
