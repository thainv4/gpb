import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('HIS_SERE_SERV')
export class HisSereServ {
  @PrimaryColumn({ name: 'ID', type: 'number' })
  id: number;

  @Column({ name: 'TDL_SERVICE_REQ_CODE', type: 'varchar2', length: 50 })
  tdlServiceReqCode: string;

  @Column({ name: 'TDL_SERVICE_CODE', type: 'varchar2', length: 50, nullable: true })
  tdlServiceCode?: string;
}
