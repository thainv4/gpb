import { IsString, IsNotEmpty, Length, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomGroupDto {
    @ApiProperty({
        description: 'Mã nhóm phòng (duy nhất)',
        example: 'VIP',
        minLength: 2,
        maxLength: 20,
    })
    @IsString({ message: 'Mã nhóm phòng phải là chuỗi' })
    @IsNotEmpty({ message: 'Mã nhóm phòng không được để trống' })
    @Length(2, 20, { message: 'Mã nhóm phòng phải từ 2 đến 20 ký tự' })
    roomGroupCode: string;

    @ApiProperty({
        description: 'Tên nhóm phòng',
        example: 'Phòng VIP',
        minLength: 2,
        maxLength: 100,
    })
    @IsString({ message: 'Tên nhóm phòng phải là chuỗi' })
    @IsNotEmpty({ message: 'Tên nhóm phòng không được để trống' })
    @Length(2, 100, { message: 'Tên nhóm phòng phải từ 2 đến 100 ký tự' })
    roomGroupName: string;

    @ApiProperty({
        description: 'Thứ tự sắp xếp',
        example: 1,
        required: false,
        minimum: 0,
    })
    @IsNumber({}, { message: 'Thứ tự sắp xếp phải là số' })
    @IsOptional()
    @Min(0, { message: 'Thứ tự sắp xếp không được nhỏ hơn 0' })
    sortOrder?: number;
}
