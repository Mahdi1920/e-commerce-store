import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { Model } from "mongoose";
import { User, UserDocument } from "../users/schemas/user.schema";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { UserRole } from "../common/enums/role.enum";
import { InjectModel } from "@nestjs/mongoose";
import { JwtService } from "@nestjs/jwt";
import { log } from "console";

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService) {}

  async register(dto: RegisterDto, file?: Express.Multer.File) {
    //console.log('Registering user:', dto);
    return this.usersService.createUser(
      {
        ...dto,
        role: UserRole.CUSTOMER, // enforce default role
        isActive: false,         // enforce inactive until email verification
      },
      file
    );
  }
  
  async activateAccount(userId: string): Promise<Partial<User>> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { isActive: true }, { new: true })
      .select("-password")
      .exec();

    if (!updatedUser) throw new NotFoundException("User not found");
    return updatedUser;
  }

  async login(email: string, password: string): Promise<{ accessToken: string; user: Partial<User> }> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) throw new NotFoundException("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException("Invalid credentials");

    const payload = { sub: user._id.toString(), email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    const { password: _, ...result } = user.toObject();
    return { accessToken, user: result };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) throw new NotFoundException("User not found");

    // TODO: generate reset token & send email
    return { message: "Password reset instructions sent to email (stub)" };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<Partial<User>> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException("User not found");

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new UnauthorizedException("Old password is incorrect");

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    const { password, ...result } = user.toObject();
    return result;
  }
}
