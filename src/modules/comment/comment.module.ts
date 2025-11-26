import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, commentSchema } from 'src/schemas/comment.schema';
import { PostModule } from 'src/modules/post/post.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: commentSchema }]),
    PostModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [MongooseModule],
})
export class CommentModule {}
