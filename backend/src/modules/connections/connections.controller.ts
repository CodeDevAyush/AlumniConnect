import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConnectionsService } from './connections.service';

@ApiTags('Connections')
@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get active network connections for user' })
  async getUserConnections(@Param('userId') userId: string) {
    return this.connectionsService.getUserConnections(userId);
  }
}
