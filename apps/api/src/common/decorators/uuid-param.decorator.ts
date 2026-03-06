import { Param } from '@nestjs/common';

export const UuidParam = (property: string) => Param(property);
