import { ApiProperty } from '@nestjs/swagger';
import { ASSIGNABLE_ROLES, type AssignableRole } from '@repo/types';
import { IsIn } from 'class-validator';

export class AddRoleDto {
  @ApiProperty({
    enum: ASSIGNABLE_ROLES,
    description: 'Rol a añadir. Solo mechanic|seller|customer (courier/admin se rechazan con 400).',
  })
  @IsIn(ASSIGNABLE_ROLES as readonly string[], {
    message: 'role debe ser uno de: mechanic, seller, customer.',
  })
  role!: AssignableRole;
}
