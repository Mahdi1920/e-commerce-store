import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
              private readonly cloudinaryService: CloudinaryService,) {}

  async createUser(dto: CreateUserDto, file?: Express.Multer.File): Promise<User> {
    try {
      let avatarUrl: string | undefined;
      
      if (file) {
        avatarUrl = await this.cloudinaryService.uploadFile(file, 'avatars');
      } else if (dto.avatar) { 
        avatarUrl = dto.avatar;
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
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
}
