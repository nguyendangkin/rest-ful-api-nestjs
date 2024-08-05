import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreatePostDTO } from 'src/post/dto/createPostDTO.dto';
import { UpdatePostDTO } from 'src/post/dto/updatePostDTO.dto';
import { PostService } from 'src/post/post.service';
import { CurrentUser } from 'src/users/decorators/currentUser.decorator';
import { User } from 'src/users/entity/user.entity';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPosts(
    @Body() createPostData: CreatePostDTO,
    @CurrentUser() currentUser: User,
  ) {
    return await this.postService.create(createPostData, currentUser);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllPosts() {
    return await this.postService.getAll();
  }

  @Get('/:id')
  async getPost(@Param('id', ParseIntPipe) id: number) {
    return await this.postService.get(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('/:id')
  @Roles(Role.User, Role.Admin)
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostData: UpdatePostDTO,
    @CurrentUser() currentUser,
  ) {
    return await this.postService.update(id, updatePostData, currentUser.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/:id')
  @Roles(Role.User, Role.Admin)
  async deletePost(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser,
  ) {
    console.log(id);

    return await this.postService.delete(id, currentUser.id);
  }
}
