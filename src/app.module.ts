import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { JoinController } from './interface/controllers/join.controller';
import { PartController } from './interface/controllers/part.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [JoinController, PartController],
  providers: [],
})
export class AppModule {}
