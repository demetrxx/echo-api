import { SetMetadata } from '@nestjs/common';

export const UN_PROTECT_KEY = 'UN_PROTECT';

export const UnProtect = () => SetMetadata(UN_PROTECT_KEY, true);
