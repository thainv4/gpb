import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('BML_RESULT_TEMPLATES')
export class ResultTemplate extends BaseEntity {
    @Column({ name: 'RESULT_TEMPLATE_CODE', type: 'varchar2', length: 50, unique: true, nullable: false })
    resultTemplateCode: string;

    @Column({ name: 'TEMPLATE_NAME', type: 'nvarchar2', length: 255, nullable: false })
    templateName: string;

    @Column({ name: 'RESULT_TEXT_TEMPLATE', type: 'clob' })
    resultTextTemplate: string;

    @Column({ name: 'RESULT_DESCRIPTION', type: 'nvarchar2', length: 1000, nullable: true })
    resultDescription?: string | null;

    @Column({ name: 'RESULT_CONCLUDE', type: 'nvarchar2', length: 1000, nullable: true })
    resultConclude?: string | null;

    @Column({ name: 'RESULT_NOTE', type: 'nvarchar2', length: 1000, nullable: true })
    resultNote?: string | null;

    @Column({ name: 'RESULT_COMMENT', type: 'nvarchar2', length: 1000, nullable: true })
    resultComment?: string | null; // Bình luận về kết quả
}

