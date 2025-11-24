import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRegisterDto } from './dtos/userRegister.dto';
import { UserLoginDto } from './dtos/userLogin.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  registerUser(@Body() body: UserRegisterDto) {
    return this.authService.registerUser(body);
  }

  @Post('login')
  loginUser(@Body() body: UserLoginDto) {
    console.log(body);
    return this.authService.loginUser(body);
  }
}
