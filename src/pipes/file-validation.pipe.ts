import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  transform(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    for (const file of files) {
      if (file.size > this.maxFileSize) {
        throw new BadRequestException(
          `File too large: ${file.originalname} (max 5MB)`,
        );
      }
      // Optional: check extension matches MIME
      const ext = file.originalname.split('.').pop()?.toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) {
        throw new BadRequestException(
          `Invalid file extension: ${file.originalname}`,
        );
      }
    }
    return files;
  }
}
