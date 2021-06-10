import {
  Body,
  Controller,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  Post
} from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { StaticAuthProvider } from "twitch-auth";
import { ApiClient } from "twitch";

@Controller()
export class AppController implements OnApplicationBootstrap, OnApplicationShutdown {

  private authProvider: StaticAuthProvider;
  private apiClient: ApiClient;

  private readonly twitchClient: string;
  private readonly twitchToken: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.twitchClient = this.configService.get<string>('TWITCH_CLIENT_ID', '');
    this.twitchToken = this.configService.get<string>(
      'TWITCH_ACCESS_TOKEN',
      '',
    );
  }

  public async onApplicationBootstrap(): Promise<void> {
    Logger.debug('Application bootstraps...', 'TwitchUser');
    this.setupAuthProvider();
    this.setupApiClient();
  }

  public onApplicationShutdown(signal?: string): void {
    Logger.debug(`Application shuts down with Signal: ${signal}`, 'TwitchUser');
  }

  private setupAuthProvider(): void {
    this.authProvider = new StaticAuthProvider(
      this.twitchClient,
      this.twitchToken,
    );
  }

  private setupApiClient(): void {
    this.apiClient = new ApiClient({ authProvider: this.authProvider });
  }

  private async getUserInfos(channel: string, username: string): Promise<void> {
    const userData = await this.apiClient.helix.users.getUserByName(username);
    const channelData = await this.apiClient.helix.users.getUserByName(channel);
    const follows = await userData.follows(channelData.id);
    //
    const userObj = {
      id: userData.id,
      username: userData.displayName,
      description: userData.description,
      createDate: userData.creationDate,
      broadcasterType: userData.broadcasterType,
      views: userData.views,
      followsChannel: follows,
    };
    Logger.debug(userObj, 'TwitchUser');
  }

  @Post('join')
  userJoined(@Body() body: { channel: string; username: string }): void {
    Logger.debug(body, 'Join');
    this.getUserInfos(body.channel.replace('#', ''), body.username);
  }

  @Post('part')
  userPart(@Body() body: { channel: string; username: string }): void {
    Logger.debug(body, 'Part');
    this.getUserInfos(body.channel.replace('#', ''), body.username);
  }

}
