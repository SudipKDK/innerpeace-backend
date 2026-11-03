import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JourneyService } from '../service/journey.service';
import { CreateJourneyDto } from '../dto/create-journey.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/role.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { UpdateJourneyDto } from '../dto/update-journey.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { validateImageBuffer } from '../../common/utils/validate-image';

@Controller('journey')
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('jwt')
  @Roles(Role.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', maxLength: 140 },
        description: { type: 'string' },
        eventDate: { type: 'string', format: 'date-time' },
        status: { type: 'string', enum: ['draft', 'published', 'archived'] },
        image: { type: 'string', format: 'binary' },
      },
      required: ['title', 'eventDate'],
    },
  })
  async create(
    @Body() createJourneyDto: CreateJourneyDto,
    @UploadedFile() image: Express.Multer.File | undefined,
  ) {
    if (image) {
      await validateImageBuffer(image);
    }
    return this.journeyService.createJourney(createJourneyDto, image);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('jwt')
  @Roles(Role.ADMIN)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', maxLength: 140 },
        description: { type: 'string' },
        eventDate: { type: 'string', format: 'date-time' },
        status: { type: 'string', enum: ['draft', 'published', 'archived'] },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJourneyDto: UpdateJourneyDto,
    @UploadedFile() image: Express.Multer.File | undefined,
  ) {
    if (image) {
      await validateImageBuffer(image);
    }
    return this.journeyService.updateJourney(id, updateJourneyDto, image);
  }
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('jwt')
  @Roles(Role.ADMIN)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.journeyService.removeJourney(id);
  }

  @Get()
  get() {
    return this.journeyService.getJourney();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('jwt')
  @Roles(Role.ADMIN)
  @Get('admin')
  getAllAdmin() {
    return this.journeyService.getAllJourneyAdmin();
  }
}
