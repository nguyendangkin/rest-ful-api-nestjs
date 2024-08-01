import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { AuthService } from 'src/auth/auth.service';
import { registerDTO } from 'src/auth/dto/registerDTO.dto';
import { Response, Request } from 'express';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('register')
  async register(@Body() registerData: registerDTO) {
    return await this.authService.register(registerData);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(req.user, res);
  }
  @Get('refresh')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      res.status(401).json({ message: 'Không tìm thấy Refresh Token' });
      return;
    }

    try {
      const { accessToken } = await this.authService.refreshToken(refreshToken);
      return { access_token: accessToken };
    } catch (error) {
      res.status(401).json({ message: 'Refresh token không hợp lệ' });
    }
  }
}
