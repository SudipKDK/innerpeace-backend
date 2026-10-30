import { Controller, Get,Post ,Body,Param, ParseIntPipe} from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}



  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  get(@Param('id',ParseIntPipe)id:number){
    return this.usersService.getUserById(id)
  };

}
