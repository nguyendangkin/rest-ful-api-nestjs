import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDTO } from 'src/users/dto/updateUserDTO.dto';
import { User } from 'src/users/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOneUser(username: string) {
    return await this.usersRepository.findOne({ where: { username } });
  }

  async findById(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  async getAllUser() {
    try {
      const user = await this.usersRepository.find();
      if (!user) {
        throw new HttpException(
          'Người dùng không tồn tại',
          HttpStatus.NOT_FOUND,
        );
      }
      return user;
    } catch (error) {
      console.error('Lỗi không xác định:', error);
      throw new HttpException(
        'Đã xảy ra lỗi',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getOneUser(username: string) {
    try {
      const user = await this.findOneUser(username);
      if (!user) {
        throw new HttpException(
          'Người dùng không tồn tại',
          HttpStatus.NOT_FOUND,
        );
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        console.error('Lỗi không xác định:', error);
        throw new HttpException(
          'Đã xảy ra lỗi',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async updateUser(updateUserData: UpdateUserDTO) {
    try {
      const { id, ...updateData } = updateUserData;

      // Kiểm tra xem người dùng có tồn tại không
      const existingUser = await this.usersRepository.findOne({
        where: { id },
      });
      if (!existingUser) {
        throw new HttpException(
          'Người dùng không tồn tại',
          HttpStatus.NOT_FOUND,
        );
      }

      // Cập nhật thông tin người dùng
      await this.usersRepository.update(id, updateData);

      return {
        message: 'Người dùng đã được cập nhật thành công!',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        console.error('Lỗi không xác định:', error);
        throw new HttpException(
          'Đã xảy ra lỗi khi cập nhật người dùng',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async deleteUser(userId: number) {
    try {
      // Kiểm tra xem người dùng có tồn tại không
      const existingUser = await this.usersRepository.findOne({
        where: { id: userId },
      });
      if (!existingUser) {
        throw new HttpException(
          'Người dùng không tồn tại',
          HttpStatus.NOT_FOUND,
        );
      }

      // Xóa người dùng
      await this.usersRepository.delete(userId);

      return {
        message: 'Người dùng đã được xóa thành công!',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        console.error('Lỗi không xác định khi xóa người dùng:', error);
        throw new HttpException(
          'Đã xảy ra lỗi khi xóa người dùng',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
