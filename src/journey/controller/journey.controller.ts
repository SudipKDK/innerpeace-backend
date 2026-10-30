import { BadRequestException, Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { JourneyService } from '../service/journey.service';
import { CreateJourneyDto } from '../dto/create-journey.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/role.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { UpdateJourneyDto } from '../dto/update-journey.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('journey')
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) { }

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
  create(
    @Body() createJourneyDto: CreateJourneyDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|webp|gif)$/ }),
        ],
        exceptionFactory: (errors) => {
          const messages = Array.isArray(errors)
            ? errors.map((error) =>
                typeof error === 'object' && (error as any).constraints
                  ? Object.values((error as any).constraints).join(', ')
                  : (error as any).message || 'File validation failed',
              )
            : [typeof errors === 'string' ? errors : 'File validation failed'];

          return new BadRequestException(
            `File validation failed: ${messages.join('; ')}`,
          );
        },
      }),
    )
    image: Express.Multer.File,
    @Req() req: any,
  ) {
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJourneyDto: UpdateJourneyDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: /^image\/(jpeg|jpg|png|webp|gif)$/,
          }),
        ],
        exceptionFactory: (errors) => {
          const messages = Array.isArray(errors)
            ? errors.map((error) =>
                typeof error === 'object' && (error as any).constraints
                  ? Object.values((error as any).constraints).join(', ')
                  : (error as any).message || 'File validation failed',
              )
            : [typeof errors === 'string' ? errors : 'File validation failed'];
          return new BadRequestException(`File validation failed: ${messages.join('; ')}`);
        },
      }),
    )
    image: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.journeyService.updateJourney(id, updateJourneyDto, image);
  }
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('jwt')
  @Roles(Role.ADMIN)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
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
