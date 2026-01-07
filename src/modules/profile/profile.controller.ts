import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/commands/create-profile.dto';
import { UpdateProfileDto } from './dto/commands/update-profile.dto';
import { GetProfilesDto } from './dto/queries/get-profiles.dto';
import { ProfileResponseDto } from './dto/responses/profile-response.dto';
import { GetProfilesResult } from './dto/responses/profiles-list-response.dto';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser as ICurrentUser } from '../../common/interfaces/current-user.interface';
import { BadRequestException } from '@nestjs/common';

@ApiTags('Profiles')
@Controller('profiles')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    // ========== COMMANDS (Write Operations) ==========

    @Post()
    @ApiOperation({ summary: 'Tạo profile mới', description: 'Tạo profile cho người dùng' })
    @ApiResponse({ status: 201, description: 'Profile đã được tạo thành công', type: ProfileResponseDto })
    @ApiBody({ type: CreateProfileDto })
    async createProfile(@Body() createDto: CreateProfileDto, @CurrentUser() currentUser: ICurrentUser | null) {
        if (!currentUser) {
            throw new BadRequestException('JWT authentication required for creating profiles. HIS token is not supported for write operations.');
        }
        const id = await this.profileService.createProfile(createDto, currentUser);
        const createdProfile = await this.profileService.getProfileById(id);
        return ResponseBuilder.success(createdProfile, 201);
    }

    @Patch('user/:userId')
    @ApiOperation({ summary: 'Cập nhật profile theo user ID', description: 'Cập nhật thông tin profile của người dùng' })
    @ApiResponse({ status: 200, description: 'Profile đã được cập nhật thành công' })
    @ApiParam({ name: 'userId', description: 'ID của người dùng' })
    @ApiBody({ type: UpdateProfileDto })
    async updateProfileByUserId(
        @Param('userId') userId: string,
        @Body() updateDto: UpdateProfileDto,
        @CurrentUser() currentUser: ICurrentUser | null
    ) {
        if (!currentUser) {
            throw new BadRequestException('JWT authentication required for updating profiles. HIS token is not supported for write operations.');
        }
        const updatedProfile = await this.profileService.updateProfile(userId, updateDto, currentUser);
        return ResponseBuilder.success(updatedProfile);
    }

    @Delete('user/:userId')
    @HttpCode(204)
    @ApiOperation({ summary: 'Xóa profile theo user ID', description: 'Xóa mềm profile của người dùng' })
    @ApiResponse({ status: 204, description: 'Profile đã được xóa thành công' })
    @ApiParam({ name: 'userId', description: 'ID của người dùng' })
    async deleteProfileByUserId(@Param('userId') userId: string, @CurrentUser() currentUser: ICurrentUser | null) {
        if (!currentUser) {
            throw new BadRequestException('JWT authentication required for deleting profiles. HIS token is not supported for write operations.');
        }
        await this.profileService.deleteProfile(userId, currentUser);
        return ResponseBuilder.success({ message: 'Profile deleted successfully' }, 204);
    }

    // ========== QUERIES (Read Operations) ==========

    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách profiles',
        description: 'Lấy danh sách profiles với phân trang và tìm kiếm'
    })
    @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
    async getProfiles(@Query() query: GetProfilesDto) {
        const result = await this.profileService.getProfiles(query);
        return ResponseBuilder.success(result);
    }

    @Get('user/:userId')
    @ApiOperation({
        summary: 'Lấy profile theo user ID',
        description: 'Lấy thông tin profile của người dùng theo user ID'
    })
    @ApiResponse({ status: 200, description: 'Lấy thông tin thành công', type: ProfileResponseDto })
    @ApiParam({ name: 'userId', description: 'ID của người dùng' })
    async getProfileByUserId(@Param('userId') userId: string) {
        const profile = await this.profileService.getProfileByUserId(userId);
        return ResponseBuilder.success(profile);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Lấy profile theo ID',
        description: 'Lấy thông tin profile theo ID'
    })
    @ApiResponse({ status: 200, description: 'Lấy thông tin thành công', type: ProfileResponseDto })
    @ApiParam({ name: 'id', description: 'ID của profile' })
    async getProfileById(@Param('id') id: string) {
        const profile = await this.profileService.getProfileById(id);
        return ResponseBuilder.success(profile);
    }

    @Get('employee/:employeeCode')
    @ApiOperation({
        summary: 'Lấy profile theo mã nhân viên',
        description: 'Lấy thông tin profile theo mã nhân viên'
    })
    @ApiResponse({ status: 200, description: 'Lấy thông tin thành công', type: ProfileResponseDto })
    @ApiParam({ name: 'employeeCode', description: 'Mã nhân viên' })
    async getProfileByEmployeeCode(@Param('employeeCode') employeeCode: string) {
        const profile = await this.profileService.getProfileByEmployeeCode(employeeCode);
        return ResponseBuilder.success(profile);
    }

    @Get('phone/:phoneNumber')
    @ApiOperation({
        summary: 'Lấy profile theo số điện thoại',
        description: 'Lấy thông tin profile theo số điện thoại'
    })
    @ApiResponse({ status: 200, description: 'Lấy thông tin thành công', type: ProfileResponseDto })
    @ApiParam({ name: 'phoneNumber', description: 'Số điện thoại' })
    async getProfileByPhoneNumber(@Param('phoneNumber') phoneNumber: string) {
        const profile = await this.profileService.getProfileByPhoneNumber(phoneNumber);
        return ResponseBuilder.success(profile);
    }
}
