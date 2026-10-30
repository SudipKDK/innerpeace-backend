import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from '../service/posts.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/common/enum/role.enum';
import { PaginationQueryDto } from 'src/common/dto/paginationQuery.dto';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Create a post (optionally with image)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'My first post' },
        content: { type: 'string', example: 'Hello world...' },
        status: { type: 'string', enum: ['draft', 'published'] },
        publishedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
        image: { type: 'string', format: 'binary' },
      },
      required: ['title'],
    },
  })

  @ApiResponse({ status: 201, description: 'Post created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (admin only)' })
  @Roles(Role.ADMIN)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
        // files: 1, // Only one file
      },
      fileFilter: (req, file, callback) => {
        // Allow only image files
        if (!file.mimetype.match(/^image\/(jpeg|jpg|png|webp|gif)$/)) {
          return callback(
            new BadRequestException('Only image files (JPEG, PNG, WebP, GIF) are allowed'),
            false,
          );
        }

        // Check file extension matches mimetype
        const fileNameParts = file.originalname.toLowerCase().split('.');
        const ext = fileNameParts.length > 1 ? fileNameParts.pop() : '';
        const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        if (!ext || !allowedExts.includes(ext)) {
          return callback(
            new BadRequestException('File extension does not match allowed types'),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async create(
    @Body() createPostDto: CreatePostDto,
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
            ? errors.flatMap((error: any) =>
              error?.constraints
                ? Object.values(error.constraints)
                : [error?.message ?? 'File validation failed'],
            )
            : [typeof errors === 'string' ? errors : 'File validation failed'];

          return new BadRequestException({
            message: 'File validation failed',
            details: messages,
          });
        },

      }),
    )
    image: Express.Multer.File,
    @Req() req: any,
  ) {
    const result = await this.postsService.createPost(createPostDto, image, req.user.id);
    return result;
  }

  @Get()
  @ApiOperation({ summary: 'List posts with pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Posts list' })
  findAll(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.postsService.findAllPosts(paginationQueryDto);
  }


  @Get('id/:id')
  @ApiOperation({ summary: 'Get a post by id' })
  @ApiResponse({ status: 200, description: 'Post details' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOneById(id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a post by id and slug (canonical URL)' })
  @ApiResponse({ status: 200, description: 'Post details' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  findOneByIdAndSlug(
    @Param('slug') slug: string,
  ) {
    return this.postsService.findOneBySlug(slug);
  }


  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a post (optionally with image)' })
  @ApiConsumes('multipart/form-data')
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
        files: 1, // Only one file
      },
      fileFilter: (req, file, callback) => {
        // Allow only image files
        if (!file.mimetype.match(/^image\/(jpeg|jpg|png|webp|gif)$/)) {
          return callback(
            new BadRequestException('Only image files (JPEG, PNG, WebP, GIF) are allowed'),
            false,
          );
        }

        // Check file extension matches mimetype
        const fileNameParts = file.originalname.toLowerCase().split('.');
        const ext = fileNameParts.length > 1 ? fileNameParts.pop() : '';
        const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        if (!ext || !allowedExts.includes(ext)) {
          return callback(
            new BadRequestException('File extension does not match allowed types'),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  @ApiResponse({ status: 200, description: 'Post updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
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
              typeof error === 'object' && error.constraints
                ? Object.values(error.constraints).join(', ')
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
    return this.postsService.updatePost(id, updatePostDto, image, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a post' })
  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Post deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.postsService.removePost(id, req.user.id);
  }
}
