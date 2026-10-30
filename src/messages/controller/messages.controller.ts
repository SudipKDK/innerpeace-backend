import { Body, Controller, Get, Post, Req, UseGuards, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { MessagesService } from '../service/messages.service';
import { CreateAnonymousMessageDto } from '../dto/create-anonymous-message.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enum/role.enum';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Post('anonymous')
    @ApiOperation({ summary: 'Send an anonymous message' })
    @ApiResponse({ status: 201, description: 'Message sent successfully' })
    @ApiResponse({ status: 400, description: 'Invalid message content' })
    async sendAnonymousMessage(
        @Body() dto: CreateAnonymousMessageDto,
        @Req() req: Request,
    ) {
        const ipAddress = req.ip || req.socket.remoteAddress;
        await this.messagesService.createMessage(dto, ipAddress);
        return { message: 'Message sent successfully', success: true };
    }

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all anonymous messages (Admin only)' })
    @ApiResponse({ status: 200, description: 'Returns all messages' })
    @ApiResponse({ status: 403, description: 'Forbidden (admin only)' })
    async getAllMessages() {
        const messages = await this.messagesService.findAll();
        const unreadCount = await this.messagesService.getUnreadCount();
        return { messages, unreadCount };
    }

    @Patch(':id/read')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Mark message as read (Admin only)' })
    @ApiResponse({ status: 200, description: 'Message marked as read' })
    @ApiResponse({ status: 403, description: 'Forbidden (admin only)' })
    async markAsRead(@Param('id', ParseIntPipe) id: number) {
        await this.messagesService.markAsRead(id);
        return { message: 'Message marked as read', success: true };
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete message (Admin only)' })
    @ApiResponse({ status: 200, description: 'Message deleted' })
    @ApiResponse({ status: 403, description: 'Forbidden (admin only)' })
    async deleteMessage(@Param('id', ParseIntPipe) id: number) {
        await this.messagesService.deleteMessage(id);
        return { message: 'Message deleted', success: true };
    }
}
