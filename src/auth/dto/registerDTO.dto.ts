import { IsEmail, IsNotEmpty } from 'class-validator';

export class registerDTO {
  @IsNotEmpty({ message: 'Username không được để trống' })
  username: string;

  @IsEmail(
    {},
    {
      message: 'Email không đúng định dạng',
    },
  )
  email: string;

  @IsNotEmpty({ message: 'FullName không được để trống' })
  fullName: string;

  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;
}
