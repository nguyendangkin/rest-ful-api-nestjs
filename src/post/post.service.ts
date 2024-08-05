import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/helpers/checkPermission.helper';
import { CreatePostDTO } from 'src/post/dto/createPostDTO.dto';
import { UpdatePostDTO } from 'src/post/dto/updatePostDTO.dto';
import { Post } from 'src/post/entity/post.entity';
import { User } from 'src/users/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}
  async create(createPostData: CreatePostDTO, currentUser: User) {
    try {
      const post = this.postRepository.create(createPostData);
      post.user = currentUser;
      await this.postRepository.save(post);
      return {
        message: 'Tạo bài viết thành công',
        post,
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

  async getAll() {
    try {
      const posts = await this.postRepository.find();
      return posts;
    } catch (error) {
      console.error('Lỗi không xác định:', error);
      throw new HttpException(
        'Đã xảy ra lỗi',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async get(id: number) {
    try {
      const post = await this.postRepository.findOneBy({ id });
      return post;
    } catch (error) {
      console.error('Lỗi không xác định:', error);
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

  async update(id: number, updatePostData: UpdatePostDTO, userId: number) {
    try {
      const post = await this.get(id);
      if (!post) {
        throw new HttpException(
          'Không tìm thấy bài post',
          HttpStatus.NOT_FOUND,
        );
      }

      Permission.checkForPost(post.userId, userId);

      const updatedPost = await this.postRepository.update(id, updatePostData);
      return {
        message: 'Cập nhật bài viết thành công',
        post: updatedPost,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        console.error('Lỗi không xác định:', error);
        throw new HttpException(
          'Đã xảy ra lỗi khi cập nhật bài post',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async delete(id: number, userId: number) {
    try {
      const post = await this.get(id);
      if (!post) {
        throw new HttpException(
          'Không tìm thấy bài post',
          HttpStatus.NOT_FOUND,
        );
      }
      Permission.checkForPost(post.userId, userId);
      await this.postRepository.delete(id);
      return {
        message: 'Xóa bài viết thành công',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        console.error('Lỗi không xác định:', error);
        throw new HttpException(
          'Đã xảy ra lỗi khi cập nhật bài post',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
