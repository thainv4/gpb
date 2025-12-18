import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { BadRequestException } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/commands/create-patient.dto';
import { UpdatePatientDto } from './dto/commands/update-patient.dto';
import { GetPatientsDto } from './dto/queries/get-patients.dto';
import { SearchPatientsDto } from './dto/queries/search-patients.dto';
import { GetPatientByIdDto } from './dto/queries/get-patient-by-id.dto';
import { GetPatientsByCmndDto } from './dto/queries/get-patients-by-cmnd.dto';
import { PatientResponseDto } from './dto/responses/patient-response.dto';
import { PatientWithLocationResponseDto } from './dto/responses/patient-with-location-response.dto';
import { PatientsListResponseDto } from './dto/responses/patients-list-response.dto';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser as ICurrentUser } from '../../common/interfaces/current-user.interface';

@ApiTags('Patients')
@Controller('patients')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PatientController {
  constructor(private readonly patientService: PatientService) { }

  // ========== COMMAND ENDPOINTS (Write Operations) ==========

  @Post()
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiResponse({ status: 201, description: 'Patient created successfully', type: PatientResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 409, description: 'Conflict - patient code or CMND already exists' })
  async createPatient(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentUser() currentUser: ICurrentUser | null,
  ) {
    if (!currentUser) {
      throw new BadRequestException('JWT authentication required for creating patients. HIS token is not supported for write operations.');
    }
    const patientId = await this.patientService.createPatient(createPatientDto, currentUser);
    return ResponseBuilder.success({ id: patientId }, HttpStatus.CREATED);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a patient by ID' })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Patient updated successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 409, description: 'Conflict - patient code or CMND already exists' })
  async updatePatient(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @CurrentUser() currentUser: ICurrentUser | null,
  ) {
    if (!currentUser) {
      throw new BadRequestException('JWT authentication required for updating patients. HIS token is not supported for write operations.');
    }
    await this.patientService.updatePatient(id, updatePatientDto, currentUser);
    return ResponseBuilder.success({ message: 'Patient updated successfully' });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a patient by ID' })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Patient deleted successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async deletePatient(@Param('id') id: string) {
    await this.patientService.deletePatient(id);
    return ResponseBuilder.success({ message: 'Patient deleted successfully' });
  }

  // ========== QUERY ENDPOINTS (Read Operations) ==========

  @Get()
  @ApiOperation({ summary: 'Get patients with pagination and filtering' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of items to skip' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'genderId', required: false, description: 'Filter by gender ID' })
  @ApiQuery({ name: 'provinceId', required: false, description: 'Filter by province ID' })
  @ApiQuery({ name: 'wardId', required: false, description: 'Filter by ward ID' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (ASC/DESC)' })
  @ApiResponse({ status: 200, description: 'Patients retrieved successfully', type: PatientsListResponseDto })
  async getPatients(@Query() query: GetPatientsDto) {
    const result = await this.patientService.getPatients(query);
    return ResponseBuilder.success(result);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search patients by various criteria' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'genderId', required: false, description: 'Filter by gender ID' })
  @ApiQuery({ name: 'provinceId', required: false, description: 'Filter by province ID' })
  @ApiQuery({ name: 'wardId', required: false, description: 'Filter by ward ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results' })
  @ApiResponse({ status: 200, description: 'Search results', type: [PatientResponseDto] })
  async searchPatients(@Query() query: SearchPatientsDto) {
    const patients = await this.patientService.searchPatients(query);
    return ResponseBuilder.success(patients);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a patient by ID' })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Patient retrieved successfully', type: PatientResponseDto })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatient(@Param('id') id: string) {
    const patient = await this.patientService.getPatientById(id);
    return ResponseBuilder.success(patient);
  }

  @Get(':id/with-location')
  @ApiOperation({ summary: 'Get a patient by ID with location information' })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Patient with location retrieved successfully', type: PatientWithLocationResponseDto })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatientWithLocation(@Param('id') id: string) {
    const patient = await this.patientService.getPatientWithLocation(id);
    return ResponseBuilder.success(patient);
  }

  @Get('cmnd/:cmndNumber')
  @ApiOperation({ summary: 'Get a patient by CMND number' })
  @ApiParam({ name: 'cmndNumber', description: 'CMND number' })
  @ApiResponse({ status: 200, description: 'Patient retrieved successfully', type: PatientResponseDto })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatientByCmnd(@Param('cmndNumber') cmndNumber: string) {
    const patient = await this.patientService.getPatientByCmnd(cmndNumber);
    return ResponseBuilder.success(patient);
  }
}
