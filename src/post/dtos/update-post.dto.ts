import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @IsMongoId({ message: 'Invalid postid' })
  postId: string;

  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  content: string;
}
