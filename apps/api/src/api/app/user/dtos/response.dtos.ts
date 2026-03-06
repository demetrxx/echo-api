import { UserEntity } from '@app/db';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'User identifier',
    example: 'user-123',
  })
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty()
  languageCode: string;

  @ApiProperty({
    description: 'User creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User last update date',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  static mapFromEntity(e: UserEntity): UserDto {
    return {
      id: e.id,
      firstName: e.firstName,
      lastName: e.lastName,
      email: e.email,
      languageCode: e.languageCode,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }
}
