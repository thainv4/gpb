import { Injectable, Scope } from '@nestjs/common';

export interface CurrentUser {
    id: string;
    username: string;
    email: string;
}

@Injectable({ scope: Scope.REQUEST })
export class CurrentUserContextService {
    private currentUser: CurrentUser | null = null;

    setCurrentUser(user: CurrentUser): void {
        this.currentUser = user;
    }

    getCurrentUser(): CurrentUser | null {
        return this.currentUser;
    }

    getCurrentUserId(): string | null {
        return this.currentUser?.id || null;
    }

    clearCurrentUser(): void {
        this.currentUser = null;
    }
}
