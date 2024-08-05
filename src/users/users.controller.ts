import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';

import { Role } from 'src/auth/enums/role.enum';
import { DeleteUserDTO } from 'src/users/dto/deleteUserDTO.dto';
import { UpdateUserDTO } from 'src/users/dto/updateUserDTO.dto';
import { UsersService } from 'src/users/users.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/users/decorators/currentUser.decorator';
import { User } from 'src/users/entity/user.entity';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @Roles(Role.Admin, Role.User)
  async getAllUser() {
    return await this.usersService.getAllUser();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put()
  @Roles(Role.User, Role.Mod, Role.Admin)
  async updateUser(
    @Body() updateUserData: UpdateUserDTO,
    @CurrentUser() currentUser: User,
  ) {
    return await this.usersService.updateUser(updateUserData, currentUser);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete()
  @Roles(Role.User, Role.Admin)
  async deleteUser(@Body() deleteUserData: DeleteUserDTO) {
    return await this.usersService.deleteUser(deleteUserData.id);
  }

  @Get(':username')
  async getOneUser(@Param('username') username: string) {
    return await this.usersService.getOneUser(username);
  }
}
