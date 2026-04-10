import { InjectDataSource } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { IServiceRequestRepository } from "../interfaces/service-request.repository.interface";
import { ServiceRequestView } from "../entities/service-request-view.entity";
import { GetServiceRequestsDto } from "../dto/queries/get-service-requests.dto";
import { GetServiceRequestsResult } from "../dto/responses/service-requests-list-response.dto";

@Injectable()
export class ServiceRequestRepository implements IServiceRequestRepository {
  constructor(
    @InjectDataSource("hisConnection")
    private readonly dataSource: DataSource,
  ) {}

  async findByCodeWithFullDetails(
    serviceReqCode: string,
  ): Promise<ServiceRequestView[]> {
    const sql = `
SELECT 
  HSR.ID,
  HSR.SERVICE_REQ_CODE,
  HSR.SERVICE_REQ_STT_ID,
  HSR.SERVICE_REQ_STT_CODE,
  HSR.SERVICE_REQ_TYPE_ID,
  HSR.SERVICE_REQ_TYPE_CODE,
  HSR.INTRUCTION_TIME,
  HSR.INTRUCTION_DATE,
  HSR.ICD_CODE,
  HSR.ICD_NAME,
  HSR.ICD_SUB_CODE,
  HSR.ICD_TEXT,
  HSR.TREATMENT_ID,
  HSR.TDL_TREATMENT_CODE TREATMENT_CODE,
  HSR.TDL_PATIENT_ID PATIENT_ID,
  HSR.TDL_PATIENT_CODE PATIENT_CODE,
  HSR.TDL_PATIENT_NAME PATIENT_NAME,
  HSR.TDL_PATIENT_DOB PATIENT_DOB,
  HSR.TDL_PATIENT_CCCD_NUMBER PATIENT_CMND_NUMBER,
  HSR.TDL_PATIENT_CCCD_DATE PATIENT_CCCD_DATE,
  HSR.TDL_PATIENT_CCCD_PLACE PATIENT_CCCD_PLACE,
  B.TDL_PATIENT_RELATIVE_MOBILE PATIENT_MOBILE,
  B.TDL_PATIENT_RELATIVE_PHONE PATIENT_PHONE,
  HSR.TDL_PATIENT_PROVINCE_CODE PATIENT_PROVINCE_CODE,
  HSR.TDL_PATIENT_PROVINCE_NAME PATIENT_PROVINCE_NAME,
  HSR.TDL_PATIENT_COMMUNE_CODE PATIENT_COMMUNE_CODE,
  HSR.TDL_PATIENT_COMMUNE_NAME PATIENT_COMMUNE_NAME,
  HSR.TDL_PATIENT_ADDRESS PATIENT_ADDRESS,
  HSR.TDL_PATIENT_GENDER_ID PATIENT_GENDER_ID,
  HSR.TDL_PATIENT_GENDER_NAME PATIENT_GENDER_NAME,
  HSR.TDL_PATIENT_CAREER_NAME PATIENT_CAREER_NAME,
  HSR.REQUEST_ROOM_ID,
  HSR.REQUEST_ROOM_CODE,
  HSR.REQUEST_ROOM_NAME,
  HSR.REQUEST_DEPARTMENT_ID,
  HSR.REQUEST_DEPARTMENT_CODE,
  HSR.REQUEST_DEPARTMENT_NAME,
  HSR.EXECUTE_ROOM_ID,
  HSR.EXECUTE_ROOM_CODE,
  HSR.EXECUTE_ROOM_NAME,
  HSR.EXECUTE_DEPARTMENT_ID,
  HSR.EXECUTE_DEPARTMENT_CODE,
  HSR.EXECUTE_DEPARTMENT_NAME,
  HSR.REQUEST_LOGINNAME,
  HSR.REQUEST_USERNAME,
  A.ID HIS_SERE_SERV_ID,
  A.ID SERE_SERV_ID,
  A.SERVICE_ID,
  A.TDL_SERVICE_CODE,
  A.TDL_SERVICE_NAME,
  A.PRICE,
  SSE.INSTRUCTION_NOTE,
  (SELECT LISTAGG(TIX.TEST_INDEX_CODE, ',') WITHIN GROUP (ORDER BY TIX.TEST_INDEX_CODE)
   FROM V_HIS_SERE_SERV_TEIN TEIN
   INNER JOIN HIS_TEST_INDEX TIX ON TEIN.TEST_INDEX_ID = TIX.ID
   WHERE TEIN.SERE_SERV_ID = A.ID
     AND TEIN.IS_DELETE = 0
     AND TIX.IS_DELETE = 0
  ) TEST_INDEX_CODES,
  HSR.BARCODE
FROM
  (
    SELECT
      ID,
      SERVICE_REQ_CODE,
      SERVICE_REQ_STT_ID,
      SERVICE_REQ_STT_CODE,
      SERVICE_REQ_TYPE_ID,
      SERVICE_REQ_TYPE_CODE,
      INTRUCTION_TIME,
      INTRUCTION_DATE,
      ICD_CODE,
      ICD_NAME,
      ICD_SUB_CODE,
      ICD_TEXT,
      TREATMENT_ID,
      TDL_TREATMENT_CODE,
      TDL_PATIENT_ID,
      TDL_PATIENT_CODE,
      TDL_PATIENT_NAME,
      TDL_PATIENT_DOB,
      TDL_PATIENT_CCCD_NUMBER,
      TDL_PATIENT_CCCD_DATE,
      TDL_PATIENT_CCCD_PLACE,
      TDL_PATIENT_PROVINCE_CODE,
      TDL_PATIENT_PROVINCE_NAME,
      TDL_PATIENT_COMMUNE_CODE,
      TDL_PATIENT_COMMUNE_NAME,
      TDL_PATIENT_ADDRESS,
      TDL_PATIENT_GENDER_ID,
      TDL_PATIENT_GENDER_NAME,
      TDL_PATIENT_CAREER_NAME,
      REQUEST_ROOM_ID,
      REQUEST_ROOM_CODE,
      REQUEST_ROOM_NAME,
      REQUEST_DEPARTMENT_ID,
      REQUEST_DEPARTMENT_CODE,
      REQUEST_DEPARTMENT_NAME,
      EXECUTE_ROOM_ID,
      EXECUTE_ROOM_CODE,
      EXECUTE_ROOM_NAME,
      EXECUTE_DEPARTMENT_ID,
      EXECUTE_DEPARTMENT_CODE,
      EXECUTE_DEPARTMENT_NAME,
      REQUEST_LOGINNAME,
      REQUEST_USERNAME,
      BARCODE
    FROM V_HIS_SERVICE_REQ
    WHERE SERVICE_REQ_CODE = :1
  ) HSR
  LEFT JOIN HIS_SERE_SERV A ON HSR.ID = A.SERVICE_REQ_ID
  LEFT JOIN HIS_SERE_SERV_EXT SSE ON A.ID = SSE.SERE_SERV_ID
  LEFT JOIN HIS_TREATMENT B ON HSR.TREATMENT_ID=B.ID
WHERE
  A.IS_DELETE = 0
  AND A.IS_NO_EXECUTE is null`;

    const rows: any[] = await this.dataSource.query(sql, [serviceReqCode]);

    // Map Oracle uppercase columns to camelCase keys expected by service mapper
    const mapped: ServiceRequestView[] = rows.map((r) => ({
      id: r.ID,
      serviceReqCode: r.SERVICE_REQ_CODE,
      serviceReqSttId: r.SERVICE_REQ_STT_ID,
      serviceReqSttCode: r.SERVICE_REQ_STT_CODE,
      serviceReqTypeId: r.SERVICE_REQ_TYPE_ID,
      serviceReqTypeCode: r.SERVICE_REQ_TYPE_CODE,
      instructionTime: r.INTRUCTION_TIME,
      instructionDate: r.INTRUCTION_DATE,
      icdCode: r.ICD_CODE,
      icdName: r.ICD_NAME,
      icdSubCode: r.ICD_SUB_CODE,
      icdText: r.ICD_TEXT,
      treatmentId: r.TREATMENT_ID,
      treatmentCode: r.TREATMENT_CODE,
      patientId: r.PATIENT_ID,
      patientCode: r.PATIENT_CODE,
      patientName: r.PATIENT_NAME,
      patientDob: r.PATIENT_DOB,
      patientCmndNumber: r.PATIENT_CMND_NUMBER,
      patientCmndDate: r.PATIENT_CCCD_DATE,
      patientCmndPlace: r.PATIENT_CCCD_PLACE,
      patientMobile: r.PATIENT_MOBILE,
      patientPhone: r.PATIENT_PHONE,
      patientProvinceCode: r.PATIENT_PROVINCE_CODE,
      patientProvinceName: r.PATIENT_PROVINCE_NAME,
      patientCommuneCode: r.PATIENT_COMMUNE_CODE,
      patientCommuneName: r.PATIENT_COMMUNE_NAME,
      patientAddress: r.PATIENT_ADDRESS,
      patientGenderId: r.PATIENT_GENDER_ID,
      patientGenderName: r.PATIENT_GENDER_NAME,
      patientCareerName: r.PATIENT_CAREER_NAME,
      requestRoomId: r.REQUEST_ROOM_ID,
      requestRoomCode: r.REQUEST_ROOM_CODE,
      requestRoomName: r.REQUEST_ROOM_NAME,
      requestDepartmentId: r.REQUEST_DEPARTMENT_ID,
      requestDepartmentCode: r.REQUEST_DEPARTMENT_CODE,
      requestDepartmentName: r.REQUEST_DEPARTMENT_NAME,
      executeRoomId: r.EXECUTE_ROOM_ID,
      executeRoomCode: r.EXECUTE_ROOM_CODE,
      executeRoomName: r.EXECUTE_ROOM_NAME,
      executeDepartmentId: r.EXECUTE_DEPARTMENT_ID,
      executeDepartmentCode: r.EXECUTE_DEPARTMENT_CODE,
      executeDepartmentName: r.EXECUTE_DEPARTMENT_NAME,
      requestLoginname: r.REQUEST_LOGINNAME,
      requestUsername: r.REQUEST_USERNAME,
      hisSereServId: r.HIS_SERE_SERV_ID,
      serviceId: r.SERVICE_ID,
      serviceCode: r.TDL_SERVICE_CODE,
      serviceName: r.TDL_SERVICE_NAME,
      price: r.PRICE,
      instructionNote: r.INSTRUCTION_NOTE ?? null,
      testIndexCodes: r.TEST_INDEX_CODES ?? null,
      barcodeXn: r.BARCODE,
    })) as any;

    return mapped;
  }

  /** Bỏ TDL_INSTRUCTION_NOTE khỏi object trả về (SELECT * vẫn đọc cột trên DB). */
  private stripTdlInstructionNote(rows: any[]): any[] {
    return rows.map((row) => {
      if (!row || typeof row !== "object") {
        return row;
      }
      const copy = { ...row };
      delete copy.TDL_INSTRUCTION_NOTE;
      delete copy.tdl_instruction_note;
      return copy;
    });
  }

  async findAll(
    query: GetServiceRequestsDto,
  ): Promise<GetServiceRequestsResult> {
    const {
      limit = 10,
      offset = 0,
      serviceReqCode,
      patientCode,
      fromDate,
      toDate,
    } = query;

    let whereClause = "1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (serviceReqCode) {
      whereClause += ` AND SERVICE_REQ_CODE = :${paramIndex}`;
      params.push(serviceReqCode);
      paramIndex++;
    }

    if (patientCode) {
      whereClause += ` AND TDL_PATIENT_CODE = :${paramIndex}`;
      params.push(patientCode);
      paramIndex++;
    }

    // Optional keyword search can be added here later

    if (fromDate) {
      whereClause += ` AND INTRUCTION_DATE >= :${paramIndex}`;
      params.push(fromDate);
      paramIndex++;
    }

    if (toDate) {
      whereClause += ` AND INTRUCTION_DATE <= :${paramIndex}`;
      params.push(toDate);
      paramIndex++;
    }

    const countQuery = `
            SELECT COUNT(DISTINCT ID) as total 
            FROM V_HIS_SERVICE_REQ 
            WHERE ${whereClause}
        `;

    const dataQuery = `
            SELECT * FROM V_HIS_SERVICE_REQ 
            WHERE ${whereClause}
            ORDER BY INTRUCTION_DATE DESC, ID
            OFFSET :${paramIndex} ROWS FETCH NEXT :${paramIndex + 1} ROWS ONLY
        `;

    params.push(offset);
    params.push(limit);

    const [countResult, dataResult] = await Promise.all([
      this.dataSource.query(countQuery, params.slice(0, paramIndex - 1)),
      this.dataSource.query(dataQuery, params),
    ]);

    const total = countResult[0]?.TOTAL || 0;

    return {
      serviceRequests: this.stripTdlInstructionNote(dataResult),
      total,
      limit,
      offset,
    };
  }

  async findByPatientCode(patientCode: string): Promise<ServiceRequestView[]> {
    const query = `
            SELECT * FROM V_HIS_SERVICE_REQ 
            WHERE TDL_PATIENT_CODE = :patientCode
            ORDER BY INTRUCTION_DATE DESC, ID
        `;

    const rows = await this.dataSource.query(query, [patientCode]);
    return this.stripTdlInstructionNote(rows);
  }

  async findByDateRange(
    fromDate: number,
    toDate: number,
  ): Promise<ServiceRequestView[]> {
    const query = `
            SELECT * FROM V_HIS_SERVICE_REQ 
            WHERE INTRUCTION_DATE >= :fromDate AND INTRUCTION_DATE <= :toDate
            ORDER BY INTRUCTION_DATE DESC, ID
        `;

    const rows = await this.dataSource.query(query, [fromDate, toDate]);
    return this.stripTdlInstructionNote(rows);
  }

}
