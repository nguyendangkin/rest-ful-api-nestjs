import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
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
    const userId = request.user?.userId; // Giả sử id người dùng đã được đính kèm vào request

    if (!userId) {
      return false; // Người dùng chưa được xác thực
    }

    const user = await this.usersService.findById(userId);

    if (!user) {
      return false; // Không tìm thấy người dùng
    }

    return requiredRoles.includes(user.role as Role);
  }
}
