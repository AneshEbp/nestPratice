import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { Userdetails } from 'src/decorators/user.decorator';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { GetUserDto } from './dtos/getUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @Serialize(GetUserDto)
  getUserDetails(@Userdetails('userId') userId: string) {
    return this.userService.getUserDetails(userId);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  updateUser(
    @Body() body: UpdateUserDto,
    @Userdetails('userId') userId: string,
  ) {
    return this.userService.updateUser(body , userId);
  }
}
