import { TgUserEntity, UserEntity } from '@app/db';
import { ApiProperty } from '@nestjs/swagger';

export class TgUserDto {
  @ApiProperty({
    description: 'Telegram user identifier',
    example: 'tg-user-123',
  })
  id: string;

  @ApiProperty({
    description: 'Telegram username',
    example: 'username',
  })
  username: string;

  @ApiProperty({
    description: 'Telegram ID',
    example: '123456',
  })
  telegramId: string;

  @ApiProperty({
    description: 'Telegram user creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Telegram user last update date',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  static mapFromEntity(e: TgUserEntity): TgUserDto {
    return {
      id: e.id,
      username: e.username,
      telegramId: e.telegramId,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }
}

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

  @ApiProperty({ type: TgUserDto, required: false })
  tgUser: TgUserDto | null;

  static mapFromEntity(e: UserEntity): UserDto {
    return {
      id: e.id,
      firstName: e.firstName,
      lastName: e.lastName,
      email: e.email,
      languageCode: e.languageCode,
      tgUser: e.tgUser ? TgUserDto.mapFromEntity(e.tgUser) : null,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }
}
