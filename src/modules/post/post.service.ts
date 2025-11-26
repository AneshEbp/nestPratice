import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from 'src/schemas/post.schema';
import { CreatePotsDto } from './dtos/create-post.dto';
import { User } from 'src/schemas/user.schema';
import { cloudinary, cloudinaryConfig } from 'src/config/cloudinary.config';
import { ConfigService } from '@nestjs/config';
import { unlink } from 'fs/promises';
import { error } from 'console';
import { UpdatePostDto } from './dtos/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  async createPost(
    data: CreatePotsDto,
    userId: string,
    files: Express.Multer.File[],
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('cant find the user');
    }
    cloudinaryConfig(this.configService);
    try {
      const filePath = await Promise.all(
        files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path);
          await unlink(file.path);
          return result.secure_url;
        }),
      );
      console.log(filePath);

      const newPost = new this.postModel({
        userId,
        title: data.title,
        content: data.content,
        images: filePath,
      });

      const postresult = await newPost.save();

      return {
        message: 'post created successfully',
        post: postresult,
      };
    } catch (error) {
      throw new InternalServerErrorException('Post creation failed');
    }
  }

  async getPosts(userId: string, limit: number, page: number) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('cant found user');

    limit = limit > 0 ? limit : 10;
    page = page > 0 ? page : 1;

    const skip = (page - 1) * limit;

    const posts = await this.postModel
      .find({ userId })
      .select({ title: 1, content: 1 })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const totalPosts = await this.postModel.countDocuments({ userId });
    console.log('im running');
    return {
      userId,
      page,
      limit,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      posts,
    };
  }

  async getPostById(id: string) {
    const postDetails = await this.postModel
      .findById(id)
      .populate('userId', 'name email');
    if (!postDetails) throw new NotFoundException('post not found');
    return postDetails;
  }

  async editPost(userId: string, body: UpdatePostDto) {
    const { postId } = body;
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('can not find post');

    if (userId.toString() != post.userId.toString())
      throw new UnauthorizedException();

    if (body.title) post.title = body.title;
    if (body.content) post.content = body.content;

    return post.save();
  }
}
