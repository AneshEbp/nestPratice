import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { UpdateUserDto } from './dtos/updateUser.dto';
import * as bcrypt from 'bcrypt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  async getUserDetails(userId: string) {
    const user = await this.userModel.findById({ _id: userId }).exec();
    return user;
  }
  async updateUser(data: UpdateUserDto, userId: string) {
    let user;
    try {
      user = await this.userModel.findById(userId);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    if (data.name) user.name = data.name;
    if (data.oldpassword && data.newPassword) {
      const isMatch = await bcrypt.compare(data.oldpassword, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('old password doesnt match');
      }
      let sltRnd = this.configService.get<string>('SALT_ROUNDS');
      if (!sltRnd) {
        throw new Error("can't get saltRounds");
      }
      const hashedPassword = await bcrypt.hash(
        data.newPassword,
        parseInt(sltRnd),
      );
      user.password = hashedPassword;
    }
    try {
      await user.save();
      return {
        mesasge: 'User updated successfully',
        user,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
