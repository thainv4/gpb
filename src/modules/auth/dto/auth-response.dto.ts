import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
    @ApiProperty({
        description: 'Unique identifier of the user',
        example: 'user-uuid-here'
    })
    id: string;

    @ApiProperty({
        description: 'Username of the user',
        example: 'john_doe'
    })
    username: string;

    @ApiProperty({
        description: 'Email address of the user',
        example: 'john.doe@example.com'
    })
    email: string;

    @ApiProperty({
        description: 'First name of the user',
        example: 'John'
    })
    firstName: string;

    @ApiProperty({
        description: 'Last name of the user',
        example: 'Doe'
    })
    lastName: string;

    @ApiProperty({
        description: 'Full name of the user',
        example: 'John Doe'
    })
    fullName: string;

    @ApiProperty({
        description: 'Whether the user account is active',
        example: true
    })
    isActive: boolean;
}

export class HisUserInfo {
    @ApiProperty({
        description: 'Login name from HIS system',
        example: 'vht2'
    })
    loginName: string;

    @ApiProperty({
        description: 'User name from HIS system',
        example: 'VŨ HOÀNG THAO'
    })
    userName: string;

    @ApiProperty({
        description: 'Application code from HIS system',
        example: 'HIS'
    })
    applicationCode: string;

    @ApiProperty({
        description: 'GCode from HIS system',
        example: '0000000001'
    })
    gCode: string;

    @ApiProperty({
        description: 'Email from HIS system',
        example: 'vht2@bachmai.edu.vn'
    })
    email: string;

    @ApiProperty({
        description: 'Mobile from HIS system',
        example: '0936226839'
    })
    mobile: string;
}

export class HisSessionInfo {
    @ApiProperty({
        description: 'Valid address from HIS system',
        example: '192.168.68.209'
    })
    validAddress: string;

    @ApiProperty({
        description: 'Login time from HIS system',
        example: '2025-10-28T11:31:05.4519176+07:00'
    })
    loginTime: string;

    @ApiProperty({
        description: 'Expire time from HIS system',
        example: '2025-11-27T11:31:05.4519176+07:00'
    })
    expireTime: string;

    @ApiProperty({
        description: 'Login address from HIS system',
        example: '192.168.68.209'
    })
    loginAddress: string;
}

export class HisRole {
    @ApiProperty({
        description: 'Role code from HIS system',
        example: 'CNDTG'
    })
    roleCode: string;

    @ApiProperty({
        description: 'Role name from HIS system',
        example: 'Cập nhật dòng thời gian'
    })
    roleName: string;
}

export class AuthResponseDto {
    @ApiProperty({
        description: 'JWT access token for API authentication',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWlkIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    })
    accessToken: string;

    @ApiProperty({
        description: 'JWT refresh token for getting new access tokens',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWlkIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    })
    refreshToken: string;

    @ApiProperty({
        description: 'User information',
        type: UserInfoDto
    })
    user: UserInfoDto;

    @ApiProperty({
        description: 'HIS token code for external system integration',
        example: '3f6d26f8369916d79eadfc1b09f2533ac95204efec3af2dc504d3af6064c1ff4',
        required: false
    })
    hisTokenCode?: string;

    @ApiProperty({
        description: 'HIS renew code for token refresh',
        example: 'b0d2ea39752e15b191d8707ca9ca90119480ea167f094cdc41bb92742cdec554b0d2ea39752e15b191d8707ca9ca90119480ea167f094cdc41bb92742cdec554',
        required: false
    })
    hisRenewCode?: string;

    @ApiProperty({
        description: 'HIS user information',
        type: HisUserInfo,
        required: false
    })
    hisUserInfo?: HisUserInfo;

    @ApiProperty({
        description: 'HIS session information',
        type: HisSessionInfo,
        required: false
    })
    hisSessionInfo?: HisSessionInfo;

    @ApiProperty({
        description: 'HIS user roles',
        type: [HisRole],
        required: false
    })
    hisRoles?: HisRole[];
}
