import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { MulterModule } from '@nestjs/platform-express';
import { multerOptions } from './config/multer.config';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
