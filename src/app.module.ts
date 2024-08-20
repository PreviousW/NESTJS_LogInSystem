import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DBService } from './login/dbInfo.service';
import { ConfigModule } from '@nestjs/config';
import { LoginController } from './login/login.controller';
import { MongoService } from './login/mongo.service';
import { UserService } from './login/user.service';
import * as cookieParser from "cookie-parser"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    })
  ],
  controllers: [AppController, LoginController],
  providers: [AppService, DBService, MongoService, UserService],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
