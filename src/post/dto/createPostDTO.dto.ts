import { IsNotEmpty, Length, MaxLength } from 'class-validator';

export class CreatePostDTO {
  @IsNotEmpty()
  @Length(4, 40)
  title: string;

  @MaxLength(255)
  description: string;
}
