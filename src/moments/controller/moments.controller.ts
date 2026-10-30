import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { MomentsService } from '../service/moments.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/role.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { PresignDto } from '../dto/presigned.dto';
import { MomentVideoStatus } from 'src/common/enum/moment-status.enum';

@Controller('moments')
export class MomentsController {
  constructor(private readonly momentsService: MomentsService) {
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Create presigned upload URL for a moment video' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        mimeType: { type: 'string', example: 'video/mp4' },
        ext: { type: 'string', example: 'mp4', nullable: true },
      },
      required: ['mimeType'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Presigned upload created',
    schema: {
      type: 'object',
      properties: {
        momentId: { type: 'number', example: 12 },
        key: { type: 'string', example: 'moments/raw/uuid.mp4' },
        uploadUrl: { type: 'string', example: 'https://...signed-put-url...' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error (mimeType must be video/*)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Roles(Role.ADMIN)
  @Post('presign')
  async presign(@Body() body: { mimeType: string; ext?: string }) {

    console.log('BODY RECEIVED:', body);
    const mimeType = (body?.mimeType || '').replace(/&#x2F;|&#47;/g, '/');

    if (!mimeType.startsWith('video/')) {
      throw new BadRequestException('mimeType must be a video/*');
    }
    return this.momentsService.createPresignedUpload(mimeType, body.ext);

  }
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Mark a moment video as uploaded' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        momentId: { type: 'number', example: 12 },
      },
      required: ['momentId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Moment marked as uploaded',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Moment video not found' })
  @Roles(Role.ADMIN)
  @Post('complete')
  async complete(@Body() body: { momentId: number }) {
    return this.momentsService.markUploaded(body.momentId);
  }

  @Get()
  @ApiOperation({ summary: 'List uploaded moments' })
  @ApiResponse({
    status: 200,
    description: 'Uploaded moments list',
  })
  async listUploaded() {
    return this.momentsService.listMoments(MomentVideoStatus.UPLOADED);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'List all moments (admin)' })
  @ApiResponse({
    status: 200,
    description: 'All moments list',
  })
  @Roles(Role.ADMIN)
  @Get('admin')
  async listAll() {
    return this.momentsService.listMoments();
  }

  @Get(':id/play')
  @ApiOperation({ summary: 'Get a presigned playback URL for a moment video' })
  @ApiResponse({
    status: 200,
    description: 'Presigned playback URL',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: 'https://...signed-get-url...' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Moment video not found' })
  async play(@Param('id', ParseIntPipe) id: number) {
    return this.momentsService.getPlayUrl(id);
  }
}
