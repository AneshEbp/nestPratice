import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Connection, Model, Types } from 'mongoose';
import { Comment } from 'src/schemas/comment.schema';
import { Post } from 'src/schemas/post.schema';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { abort } from 'process';
import { DeleteCommentDdto } from './dtos/delete-comment.dto';

export interface CommentWithReplies {
  _id: string;
  content: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  parentId: string;
  repliesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async createComment(userId: string, data: CreateCommentDto) {
    const { postId } = data;
    const postExists = await this.postModel.exists({ _id: postId });
    if (!postExists) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.commentModel.create({
      userId,
      postId,
      parentId: data.parentId ?? null,
      content: data.content,
    });
    return {
      message: 'comment created',
      comment,
    };
  }

  async getCommentforPost(postId: string) {
    const comments = await this.commentModel
      .find({ postId, parentId: null })
      .populate('userId', 'name email')
      .lean();

    if (!comments || comments.length === 0) {
      throw new NotFoundException('No comments found for this post');
    }
    // Add replies count to each comment
    const commentsWithReplies: CommentWithReplies[] = await Promise.all(
      comments.map(async (comment) => {
        const repliesCount = await this.commentModel.countDocuments({
          parentId: comment._id,
        });

        return {
          ...(comment as any), // <-- tell TS to ignore type mismatch here
          repliesCount, // <-- matches your CommentWithReplies type
        };
      }),
    );

    return commentsWithReplies;
  }

  async getChildrenComment(parentId: string) {
    const childrenComments = await this.commentModel.find({ parentId });
    if (!childrenComments)
      throw new NotFoundException('can not find the children comments');

    return childrenComments;
  }

  async updateComment(data: UpdateCommentDto, userId: string) {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const comment = await this.commentModel
        .findById(data.commentId)
        .session(session);
      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      if (comment.userId.toString() !== userId.toString()) {
        throw new UnauthorizedException('You cannot update this comment');
      }

      comment.content = data.content;
      await comment.save({ session });

      await session.commitTransaction();
      return { message: 'Comment updated successfully' };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteComment(data: DeleteCommentDdto, userId: string) {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const comment = await this.commentModel
        .findById(data.commentId)
        .session(session);

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      if (comment?.userId.toString() != userId.toString()) {
        session.abortTransaction();
        throw new UnauthorizedException('you cant do it');
      }
      await this.commentModel
        .findByIdAndDelete(data.commentId)
        .session(session);

      await session.commitTransaction();

      return { message: 'deleted successfully' };
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
