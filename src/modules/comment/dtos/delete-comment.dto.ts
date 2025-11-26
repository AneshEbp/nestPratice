import { IsMongoId, IsString } from 'class-validator';

export class DeleteCommentDdto {
  @IsMongoId()
  @IsString()
  commentId: string;
}
