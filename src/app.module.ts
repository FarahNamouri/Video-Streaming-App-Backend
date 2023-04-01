import { Module, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { secret } from './utils/constants';
import { join } from 'path/posix';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
// Generate random names for the files we are uploading :
import { v4 as uuidv4 } from 'uuid';
import { VideoController } from './controllers/video.controller';
import { VideoService } from './service/video.service';
import { UserService } from './service/user.service';
import { UserController } from './controllers/user.controller';
import { Video, VideoSchema } from './model/video.schema';
import { User, UserSchema } from './model/user.schema';
import { isAuthenticated } from './app.middlware';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.URI),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
    // Configuring Multer to save uploaded files to the ./public folder on the server's file system with unique filename :
    MulterModule.register({
      storage: diskStorage({
        destination: './public',
        filename: (req, file, cb) => {
          const ext = file.mimetype.split('/')[1];
          cb(null, `${uuidv4()}-${Date.now()}.${ext}`);
        },
      }),
    }),
    JwtModule.register({
      secret,
      signOptions: { expiresIn: '2h' },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  controllers: [VideoController, UserController],
  providers: [VideoService, UserService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(isAuthenticated)
      .exclude({ path: 'api/v1/video/:id', method: RequestMethod.GET })
      .forRoutes(VideoController);
  }
}
