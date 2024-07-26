import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { registerDTO } from 'src/auth/dto/registerDTO.dto';
import { User } from 'src/users/entity/user.entity';
import { Repository, TypeORMError } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleHashPassword(password: string) {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  async handleComparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  async handleGenerateAccessToken(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return this.jwtService.sign(payload, {
      expiresIn: '60m',
    });
  }

  async handleRefreshToken(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
  }

  async register(registerData: registerDTO) {
    try {
      // Kiểm tra tồn tại người dùng
      const isExistUser = await this.usersService.findOneUser(
        registerData.username,
      );
      if (isExistUser) {
        throw new HttpException('Người dùng đã tồn tại', HttpStatus.CONFLICT);
      }

      // Hash mật khẩu
      const hashedPassword = await this.handleHashPassword(
        registerData.password,
      );

      // Tạo đối tượng người dùng mới với mật khẩu đã được hash
      const newUserData = {
        ...registerData,
        password: hashedPassword,
      };

      // Tạo và lưu vào db
      const user = await this.userRepository.create(newUserData);
      await this.userRepository.save(user);

      return {
        message: 'Đăng ký người dùng thành công',
      };
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

  //  (passport/ login)
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneUser(username);
    // giải mật khẩu và so
    if (user && (await this.handleComparePassword(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const accessToken = await this.handleGenerateAccessToken(user);
    const refreshToken = await this.handleRefreshToken(user);
    return {
      username: user.username,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
