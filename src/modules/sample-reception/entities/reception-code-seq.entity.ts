import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('BML_RECEPTION_CODE_SEQ')
export class ReceptionCodeSeq {
    @PrimaryColumn({ name: 'PREFIX', type: 'varchar2', length: 50 })
    prefix: string;

    @PrimaryColumn({ name: 'DATE_STR', type: 'varchar2', length: 20 })
    dateStr: string;

    @Column({ name: 'LAST_SEQ', type: 'number', default: 0 })
    lastSeq: number;
}
