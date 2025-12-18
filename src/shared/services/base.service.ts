import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CurrentUserContextService } from './current-user-context.service';

@Injectable()
export abstract class BaseService {
  constructor(
    protected readonly dataSource: DataSource,
    protected readonly currentUserContextService: CurrentUserContextService,
  ) {}
}
