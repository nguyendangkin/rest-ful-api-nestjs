import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOneUser(username: string) {
    return this.usersRepository.findOne({ where: { username } });
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
      const user = await this.usersRepository.findOne({ where: { username } });
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
}
