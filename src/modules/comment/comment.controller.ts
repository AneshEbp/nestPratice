import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentService, CommentWithReplies } from './comment.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { Userdetails } from 'src/common/decorators/user.decorator';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { DeleteCommentDdto } from './dtos/delete-comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}
  @Post()
  @UseGuards(JwtAuthGuard)
  createcomment(
    @Body() body: CreateCommentDto,
    @Userdetails('userId') userId: string,
  ) {
    return this.commentService.createComment(userId, body);
  }

  @Get()
  getcommentbypost(
    @Body() body: { postId: string },
  ): Promise<CommentWithReplies[]> {
    return this.commentService.getCommentforPost(body.postId);
  }

  @Get('/children/:id')
  getchildrencomment(@Param('id') id: string) {
    return this.commentService.getChildrenComment(id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  updateComment(
    @Body() body: UpdateCommentDto,
    @Userdetails('userId') userId: string,
  ) {
    console.log(body);
    return this.commentService.updateComment(body, userId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  deletecomment(
    @Body() body: DeleteCommentDdto,
    @Userdetails('userId') userId: string,
  ) {
    return this.commentService.deleteComment(body, userId);
  }
}
