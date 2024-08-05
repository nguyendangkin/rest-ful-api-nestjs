import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { Role } from 'src/auth/enums/role.enum';
import { User } from 'src/users/entity/user.entity';

export class Permission {
  static checkForUser(userIdReq: number, currentUser: User) {
    // Kiểm tra quyền bổ sung
    if (userIdReq !== currentUser.id) {
      throw new BadRequestException(
        'Người dùng chỉ có thể thao tác trên tài khoản của mình',
      );
    }
  }

  static checkForPost(userIdFromDB: number, userIdFromRequest: number) {
    if (userIdFromDB !== userIdFromRequest) {
      throw new BadRequestException(
        'Bạn không có quyền thao tác với bài viết này',
      );
    }
  }
}
