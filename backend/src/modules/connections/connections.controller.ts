import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ConnectionsService } from './connections.service';
import { RequestConnectionDto } from './dto/request-connection.dto';

@ApiTags('Connections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Get('me')
  @ApiOperation({ summary: "Get the signed-in user's connections and requests" })
  async getUserConnections(@CurrentUser('id') userId: string) {
    return this.connectionsService.getUserConnections(userId);
  }

  @Get('eligibility')
  @ApiOperation({ summary: 'Check whether the signed-in user can request alumni connections' })
  async getEligibility(@CurrentUser('id') userId: string) {
    return this.connectionsService.getEligibility(userId);
  }

  @Post('requests')
  @ApiOperation({ summary: 'Request a connection with an alumni profile' })
  async requestConnection(@CurrentUser('id') userId: string, @Body() dto: RequestConnectionDto) {
    return this.connectionsService.requestConnection(userId, dto.receiverId);
  }
}
