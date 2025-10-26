/**
 * Public decorator for marking routes as public (no auth required)
 */

import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../guards/auth.guard';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
