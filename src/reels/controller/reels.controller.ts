import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReelsService } from '../service/reels.service';
import { CreateReelDto } from '../dto/create-reel.dto';
import { UpdateReelDto } from '../dto/update-reel.dto';
import { JwtAuthGuard } from 'src/auth/bcrypt.helper';

@ApiTags('Reels')
@Controller('reels')
export class ReelsController {
    constructor(private readonly reelsService: ReelsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all active reels (public)' })
    findAll() {
        return this.reelsService.findAll();
    }

    @Get('admin')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('jwt')
    @ApiOperation({ summary: 'Get all reels (admin)' })
    findAllAdmin() {
        return this.reelsService.findAllAdmin();
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('jwt')
    @ApiOperation({ summary: 'Create a new reel' })
    create(@Body() dto: CreateReelDto) {
        return this.reelsService.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('jwt')
    @ApiOperation({ summary: 'Update a reel' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReelDto) {
        return this.reelsService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('jwt')
    @ApiOperation({ summary: 'Delete a reel' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.reelsService.remove(id);
    }
}
