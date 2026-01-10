import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HisSereServ } from '../service-request/entities/his-sere-serv.entity';
import { GetHisSereServDto } from './dto/get-his-sere-serv.dto';
import { HisSereServResponseDto } from './dto/his-sere-serv-response.dto';

@Injectable()
export class HisSereServService {
    constructor(
        @InjectRepository(HisSereServ, 'hisConnection')
        private readonly hisSereServRepo: Repository<HisSereServ>,
    ) { }

    async getHisSereServId(dto: GetHisSereServDto): Promise<HisSereServResponseDto> {
        const { tdlServiceReqCode, tdlServiceCode } = dto;

        const record = await this.hisSereServRepo.findOne({
            where: { 
                tdlServiceReqCode,
                tdlServiceCode,
            },
            select: ['id'],
        });

        if (!record) {
            throw new NotFoundException(
                `Không tìm thấy HIS_SERE_SERV với tdlServiceReqCode: ${tdlServiceReqCode} và tdlServiceCode: ${tdlServiceCode}`
            );
        }

        return {
            id: record.id,
            accessionNumber: record.id.toString(), // AccessionNumber là ID convert sang string
        };
    }
}
