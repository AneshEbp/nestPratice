import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePotsDto } from './dtos/create-post.dto';
import { Userdetails } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer.config';
import { FileValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { UpdatePostDto } from './dtos/update-post.dto';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions))
  createPost(
    @Body() body: CreatePotsDto,
    @Userdetails('userId') userId: string,
    @UploadedFiles(new FileValidationPipe()) files: Express.Multer.File[],
  ) {
    return this.postService.createPost(body, userId, files);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getposts(
    @Userdetails('userId') userId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.postService.getPosts(userId, Number(page), Number(limit));
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  getpostbyid(@Param('id') id: string) {
    return this.postService.getPostById(id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  updatePost(
    @Body() body: UpdatePostDto,
    @Userdetails('userId') userId: string,
  ) {
    return this.postService.editPost(userId, body);
  }
}
