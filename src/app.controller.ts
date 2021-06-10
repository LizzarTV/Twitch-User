import { Body, Controller, Logger, Post } from "@nestjs/common";

@Controller()
export class AppController {

  @Post('join')
  userJoined(@Body() body: { channel: string; username: string }): void {
    Logger.debug(body, 'Join');
  }

  @Post('part')
  userPart(@Body() body: { channel: string; username: string }): void {
    Logger.debug(body, 'Part');
  }

}
