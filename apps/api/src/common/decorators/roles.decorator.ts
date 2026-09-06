import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@wantere/types';

export const ROLES_KEY = 'auth:roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
