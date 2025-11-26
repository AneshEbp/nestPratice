import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, postSchema } from 'src/schemas/post.schema';
import { UserModule } from 'src/modules/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: postSchema }]),
    UserModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [MongooseModule],
})
export class PostModule {}
