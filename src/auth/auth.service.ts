import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { UserRegisterDto } from './dtos/userRegister.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserLoginDto } from './dtos/userLogin.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async registerUser(data: UserRegisterDto) {
    const { name, email, password } = data;

    const findUser = await this.userModel.findOne({ email });
    if (findUser) {
      throw new ConflictException('user already exists');
    }
    const sltrnd = this.configService.get<string>('SALT_ROUNDS');
    if (!sltrnd) {
      throw new Error('cant get salt rounds');
    }

    const hashedPassword = await bcrypt.hash(password, parseInt(sltrnd));
    const newUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
    });

    try {
      await newUser.save();
    } catch (err) {
      throw new InternalServerErrorException('Failed to register user');
    }
    return 'user registered';
  }

  async loginUser(data: UserLoginDto) {
    const { email, password } = data;

    console.log(data);
    let user;
    try {
      user = await this.userModel.findOne({ email });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user._id, email: user.email };
    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }
}
