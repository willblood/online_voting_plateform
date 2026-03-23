import { Role } from '../../../common/enums/role.enum.js';

export class User {
  id: string;
  national_id: string;
  email: string;
  password_hash: string;
  role: Role;
  municipality_id: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
