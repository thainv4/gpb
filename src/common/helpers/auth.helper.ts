import { BadRequestException } from '@nestjs/common';
import { CurrentUser } from '../decorators/current-user.decorator';

/**
 * Helper function để kiểm tra currentUser cho write operations
 * @param currentUser - CurrentUser từ decorator (có thể null nếu dùng HIS token)
 * @param operationName - Tên operation để hiển thị trong error message
 * @throws BadRequestException nếu currentUser là null
 */
export function requireJwtAuth(currentUser: CurrentUser | null, operationName: string): asserts currentUser is CurrentUser {
    if (!currentUser) {
        throw new BadRequestException(
            `JWT authentication required for ${operationName}. HIS token is not supported for write operations.`
        );
    }
}

