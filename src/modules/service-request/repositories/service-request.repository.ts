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
  HSR.NOTE,
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
  A.ID HIS_SERE_SERV_ID,
  A.ID SERE_SERV_ID,
  A.SERVICE_ID,
  A.TDL_SERVICE_CODE,
  A.TDL_SERVICE_NAME,
  A.PRICE
FROM
  V_HIS_SERVICE_REQ HSR
  LEFT JOIN HIS_SERE_SERV A ON HSR.ID = A.SERVICE_REQ_ID
  LEFT JOIN HIS_TREATMENT B ON HSR.TREATMENT_ID=B.ID
WHERE
  HSR.SERVICE_REQ_CODE = :1 AND A.IS_DELETE = 0`;

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
      note: r.NOTE,
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
      hisSereServId: r.HIS_SERE_SERV_ID,
      serviceId: r.SERVICE_ID,
      serviceCode: r.TDL_SERVICE_CODE,
      serviceName: r.TDL_SERVICE_NAME,
      price: r.PRICE,
    })) as any;

    return mapped;
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
      serviceRequests: dataResult,
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

    return this.dataSource.query(query, [patientCode]);
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

    return this.dataSource.query(query, [fromDate, toDate]);
  }

  async getStatistics(): Promise<any> {
    const query = `
            SELECT 
                COUNT(DISTINCT ID) as totalRequests,
                COUNT(DISTINCT TDL_PATIENT_ID) as totalPatients,
                COUNT(DISTINCT HIS_SERE_SERV_ID) as totalServices,
                SUM(PRICE) as totalRevenue,
                AVG(PRICE) as averagePrice
            FROM V_HIS_SERVICE_REQ
        `;

    const result = await this.dataSource.query(query);
    return result[0] || {};
  }
}
