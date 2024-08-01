import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { registerDTO } from 'src/auth/dto/registerDTO.dto';
import { User } from 'src/users/entity/user.entity';
import { Repository, TypeORMError } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { from, map, Observable } from 'rxjs';

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
      expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRATION'),
    });
  }

  async handleGenerateRefreshToken(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRATION'),
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

  async login(user: any, res: Response) {
    const accessToken = await this.handleGenerateAccessToken(user);
    const refreshToken = await this.handleGenerateRefreshToken(user);

    // Set refresh token in HTTP-only cookie
    this.setRefreshTokenCookie(res, refreshToken);

    return {
      username: user.username,
      access_token: accessToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const newPayload = { username: payload.username, sub: payload.sub };
      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRATION'),
      });
      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }

  private setRefreshTokenCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: this.configService.get('JWT_SECRET'), // Use secure cookies in production
      sameSite: 'strict', // Protect against CSRF
      maxAge: this.configService.get('REFRESH_TOKEN_EXPIRATION'), // 7 days
    });
  }
}
