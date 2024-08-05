import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';

import { Role } from 'src/auth/enums/role.enum';
import { Permission } from 'src/helpers/checkPermission.helper';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id; // Giả sử id người dùng đã được đính kèm vào request

    if (!userId) {
      throw new HttpException(
        'Người dùng chưa được xác thực',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new HttpException(
        'Không tìm thấy người dùng',
        HttpStatus.NOT_FOUND,
      );
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new HttpException(
        'Người dùng không có quyền cần thiết',
        HttpStatus.FORBIDDEN,
      );
    }

    // // Kiểm tra quyền bổ sung
    // const targetUserId = request.body.id;
    // if (user.role === Role.User && userId !== +targetUserId) {
    //   throw new HttpException(
    //     'Người dùng chỉ có thể thao tác trên tài khoản của mình',
    //     HttpStatus.FORBIDDEN,
    //   );
    // }

    return true;
  }
}
