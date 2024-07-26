import { IsEmail, IsNotEmpty } from 'class-validator';

export class loginDTO {
  @IsNotEmpty({ message: 'Username không được để trống' })
  username: string;

  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;
}
