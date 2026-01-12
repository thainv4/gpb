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

    async getHisSereServId(dto: GetHisSereServDto): Promise<HisSereServResponseDto[]> {
        const { tdlServiceReqCode, tdlServiceCode } = dto;

        // Build where condition dynamically
        const whereCondition: any = {
            tdlServiceReqCode,
        };
        
        if (tdlServiceCode !== undefined && tdlServiceCode !== null && tdlServiceCode !== '') {
            whereCondition.tdlServiceCode = tdlServiceCode;
        }

        const records = await this.hisSereServRepo.find({
            where: whereCondition,
            select: ['id'],
        });

        return records.map(record => ({
            id: record.id,
            accessionNumber: record.id.toString(), // AccessionNumber là ID convert sang string
        }));
    }
}
