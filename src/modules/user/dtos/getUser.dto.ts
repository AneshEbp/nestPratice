import { Expose } from 'class-transformer';

export class GetUserDto {
  @Expose()
  name: string;

  @Expose()
  email: string;
}
