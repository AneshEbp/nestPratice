import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import mongoose from 'mongoose';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsMongoId()
  @IsString()
  postId: string;

  @IsMongoId()
  @IsString()
  @IsOptional()
  parentId?: string;
}
