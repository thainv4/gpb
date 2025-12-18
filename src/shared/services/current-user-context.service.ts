import { Injectable, Scope } from '@nestjs/common';
import { CurrentUser } from '../interfaces/current-user.interface';

@Injectable({ scope: Scope.REQUEST })
export class CurrentUserContextService {
  private currentUser: CurrentUser | null = null;

  setCurrentUser(user: CurrentUser): void {
    this.currentUser = user;
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUser;
  }

  clearCurrentUser(): void {
    this.currentUser = null;
  }
}
