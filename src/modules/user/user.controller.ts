import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards, Request, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { UserService, CurrentUser } from './user.service';
import { CreateUserDto } from './dto/commands/create-user.dto';
import { UpdateUserDto } from './dto/commands/update-user.dto';
import { GetUsersDto } from './dto/queries/get-users.dto';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { CurrentUser as CurrentUserDecorator } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiHeader({
    name: 'TokenCode',
    description: 'HIS token code (optional - nếu không có JWT token)',
    required: false,
})
@ApiHeader({
    name: 'ApplicationCode',
    description: 'HIS application code (optional - nếu không có JWT token)',
    required: false,
})
export class UserController {
    constructor(private readonly userService: UserService) { }

    // ========== COMMAND ENDPOINTS (Write Operations) ==========

    @Post()
    @ApiOperation({
        summary: 'Create a new user',
        description: 'Creates a new user account with the provided information'
    })
    @ApiResponse({
        status: 201,
        description: 'User created successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 201 },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'user-uuid-here' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid JWT token' })
    async createUser(
        @Body() createUserDto: CreateUserDto,
        @CurrentUserDecorator() currentUser: CurrentUser | null,
        @Request() req: any,
    ) {
        if (!currentUser) {
            throw new BadRequestException('JWT authentication required for creating users. HIS token is not supported for write operations.');
        }
        const userId = await this.userService.createUser(createUserDto, currentUser);
        return ResponseBuilder.success({ id: userId }, 201);
    }

    @Put(':id')
    async updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @CurrentUserDecorator() currentUser: CurrentUser | null,
        @Request() req: any,
    ) {
        if (!currentUser) {
            throw new BadRequestException('JWT authentication required for updating users. HIS token is not supported for write operations.');
        }
        await this.userService.updateUser(id, updateUserDto, currentUser);
        return ResponseBuilder.success({ message: 'User updated successfully' });
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: string) {
        await this.userService.deleteUser(id);
        return ResponseBuilder.success({ message: 'User deleted successfully' });
    }

    @Patch(':id/activate')
    async activateUser(@Param('id') id: string) {
        await this.userService.activateUser(id);
        return ResponseBuilder.success({ message: 'User activated successfully' });
    }

    // ========== QUERY ENDPOINTS (Read Operations) ==========

    @Get()
    async getUsers(@Query() query: GetUsersDto) {
        const result = await this.userService.getUsers(query);
        return ResponseBuilder.success(result);
    }

    @Get(':id')
    async getUser(@Param('id') id: string) {
        const user = await this.userService.getUserById(id);
        return ResponseBuilder.success(user);
    }

    @Get('email/:email')
    async findUserByEmail(@Param('email') email: string) {
        const user = await this.userService.findUserByEmail(email);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return ResponseBuilder.success(user);
    }
}
