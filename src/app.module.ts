import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostModule } from './modules/post/post.module';
import { MulterModule } from '@nestjs/platform-express';
import { multerOptions } from './config/multer.config';
import { CommentModule } from './modules/comment/comment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        connectionFactory: (connection) => {
          console.log('mongodb Connected');
          return connection;
        },
      }),
    }),
    MulterModule.register(multerOptions),

    UserModule,

    AuthModule,

    PostModule,

    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
