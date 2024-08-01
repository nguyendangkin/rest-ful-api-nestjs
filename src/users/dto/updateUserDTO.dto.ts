import { Role } from 'src/enums/role.enum';

export class UpdateUserDTO {
  id: number;

  username: string;

  fullName: string;

  email: string;

  password: string;

  role: Role;
}
