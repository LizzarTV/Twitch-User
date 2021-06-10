import {
  StaticAuthProvider,
  RefreshableAuthProvider,
  AccessToken,
} from 'twitch-auth';
import { ApiClient, HelixChannel, HelixStream, HelixUser } from 'twitch';
import { ConfigService } from '@nestjs/config';
import {
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';

export abstract class BaseController
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly twitchClient: string;
  private readonly twitchSecret: string;
  private readonly twitchRefresh: string;
  private twitchToken: string;

  private authProvider: RefreshableAuthProvider;
  private apiClient: ApiClient;

  constructor(private readonly configService: ConfigService) {
    this.twitchClient = this.configService.get<string>('TWITCH_CLIENT_ID', '');
    this.twitchSecret = this.configService.get<string>(
      'TWITCH_CLIENT_SECRET',
      '',
    );
    this.twitchToken = this.configService.get<string>(
      'TWITCH_ACCESS_TOKEN',
      '',
    );
    this.twitchRefresh = this.configService.get<string>(
      'TWITCH_REFRESH_TOKEN',
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
    this.authProvider = new RefreshableAuthProvider(
      new StaticAuthProvider(this.twitchClient, this.twitchToken),
      {
        clientSecret: this.twitchSecret,
        refreshToken: this.twitchRefresh,
        onRefresh: (token: AccessToken) => {
          this.twitchToken = token.accessToken;
          console.error('token', token);
          this.setupApiClient();
        },
      },
    );
  }

  private setupApiClient(): void {
    this.apiClient = new ApiClient({ authProvider: this.authProvider });
  }

  public async getUserInfos(username: string): Promise<HelixUser> {
    return await this.apiClient.helix.users.getUserByName(username);
  }

  public async getStreamInfos(username: string): Promise<HelixStream> {
    return await this.apiClient.helix.streams.getStreamByUserName(username);
  }

  public async getChannelInfos(username: string): Promise<HelixChannel> {
    const user = await this.getUserInfos(username);
    return await this.apiClient.helix.channels.getChannelInfo(user.id);
  }

  public async isUserFollowingChannel(
    channel: string,
    username: string,
  ): Promise<boolean> {
    const userData = await this.getUserInfos(username);
    const channelData = await this.getChannelInfos(channel.replace('#', ''));
    //
    return (await userData.follows(channelData.id)) || false;
  }
}
