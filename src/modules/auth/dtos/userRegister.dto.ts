import { IsEmail, IsString, MinLength } from 'class-validator';

export class UserRegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  password: string;
}
