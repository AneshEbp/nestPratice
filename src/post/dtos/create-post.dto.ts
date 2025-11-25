import { IsString } from 'class-validator';

export class CreatePotsDto {
  @IsString()
  title: string;

  @IsString()
  content: string;
}
