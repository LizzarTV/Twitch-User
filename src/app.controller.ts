import {
  Body,
  Controller,
  HttpService,
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

  private async getUserInfos(username: string): Promise<void> {
    const data = await this.apiClient.helix.users.getUserByName(username);
    Logger.debug(data, 'TwitchUser');
  }

  @Post('join')
  userJoined(@Body() body: { channel: string; username: string }): void {
    Logger.debug(body, 'Join');
    this.getUserInfos(body.username);
  }

  @Post('part')
  userPart(@Body() body: { channel: string; username: string }): void {
    Logger.debug(body, 'Part');
  }

}
