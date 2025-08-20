import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UserRole } from '../../common/enums/role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true }) fullname: string;
  @Prop({ required: true, unique: true }) email: string;
  @Prop({ required: true }) username: string;
  @Prop({ required: true }) password: string;
  @Prop({ enum: UserRole, default: UserRole.CUSTOMER }) role: UserRole;
  @Prop() address: string;
  @Prop() phone: string;
  @Prop() avatar: string;
  @Prop() isActive: boolean;
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] }) wishlist: mongoose.Types.ObjectId[];
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }] }) orders: mongoose.Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
