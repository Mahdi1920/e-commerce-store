import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
/* 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
}); */

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
              private readonly cloudinaryService: CloudinaryService,) {}

  /* async uploadAvatar(file: Express.Multer.File): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'avatars' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
} */

  async createUser(dto: CreateUserDto, file?: Express.Multer.File): Promise<User> {
    try {
      let avatarUrl: string | undefined;
      
      if (file) {
        avatarUrl = await this.cloudinaryService.uploadFile(file, 'avatars');
      } else if (dto.avatar) {
        avatarUrl = dto.avatar;
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      console.log('user : ', dto);
      console.log('avatar : ', avatarUrl);
      const newUser = new this.userModel({
        ...dto,
        password: hashedPassword,
        avatar: avatarUrl,
        wishlist: dto.wishlist ?? [], // ✅ ensures it's always an array
        orders: dto.orders ?? [],     // ✅ ensures it's always an array
      });

      return await newUser.save();
    } catch (error) {
      console.error('Error creating user:', error);
      throw new BadRequestException('Failed to create user');
    }
  
  }

  async addUser(dto: CreateUserDto, file?: Express.Multer.File) {
    return this.createUser(dto, file);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).select('-password').exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto, file?: Express.Multer.File): Promise<User> {
  if (dto.password) {
    dto.password = await bcrypt.hash(dto.password, 10);
  }
  if (file) {
    dto.avatar = await this.cloudinaryService.uploadFile(file, 'avatars');
  }

  // Clean dto to prevent overwriting fields with undefined
  Object.keys(dto).forEach((key) => dto[key] === undefined && delete dto[key]);

  const updatedUser = await this.userModel
    .findByIdAndUpdate(id, dto, { new: true })
    .select('-password')
    .exec();

  if (!updatedUser) throw new NotFoundException('User not found');
  return updatedUser;
}


  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('User not found');
  }

  // Change password
  /* async changePassword(id: string, oldPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new BadRequestException('Old password is incorrect');
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return { message: 'Password changed successfully' };
  } */

  // Forgot password (stub implementation)
  /* async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) throw new NotFoundException('User not found');
    // Here you would generate a reset token and send an email
    // For now, just return a message
    return { message: 'Password reset instructions sent to email (stub)' };
  } */
}
