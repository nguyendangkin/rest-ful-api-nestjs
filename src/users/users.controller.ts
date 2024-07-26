import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAllUser() {
    return await this.usersService.getAllUser();
  }

  @Get(':username')
  async getOneUser(@Param('username') username: string) {
    return await this.usersService.getOneUser(username);
  }
}
