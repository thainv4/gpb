import { ServiceRequestView } from '../entities/service-request-view.entity';
import { GetServiceRequestsDto } from '../dto/queries/get-service-requests.dto';
import { GetServiceRequestsResult } from '../dto/responses/service-requests-list-response.dto';

export interface IServiceRequestRepository {
    findByCodeWithFullDetails(serviceReqCode: string): Promise<ServiceRequestView[]>;
    findAll(query: GetServiceRequestsDto): Promise<GetServiceRequestsResult>;
    findByPatientCode(patientCode: string): Promise<ServiceRequestView[]>;
    findByDateRange(fromDate: number, toDate: number): Promise<ServiceRequestView[]>;
    getStatistics(): Promise<any>;
}
