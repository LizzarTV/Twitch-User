import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseController } from './base.controller';

@Controller()
export class PartController extends BaseController {
  constructor(private readonly config: ConfigService) {
    super(config);
  }

  @Post('part')
  async onJoin(
    @Body() body: { channel: string; username: string },
  ): Promise<any> {
    const userData = await this.getUserInfos(body.username);
    const isFollowing = await this.isUserFollowingChannel(
      body.channel,
      body.username,
    );
    const userObj = {
      id: userData.id,
      username: userData.displayName,
      description: userData.description,
      createDate: userData.creationDate,
      broadcasterType: userData.broadcasterType,
      views: userData.views,
      isFollowing,
    };
    return userObj;
  }
}
