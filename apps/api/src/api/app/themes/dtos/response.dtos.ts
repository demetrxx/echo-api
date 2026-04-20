import { PostEntity, StrategyEntity, ThemeEntity } from '@app/db';
import { ApiProperty } from '@nestjs/swagger';

import { PostDto } from '@/api/app/posts';

export class ThemeDto {
  @ApiProperty({
    description: 'Theme identifier',
    example: 'theme-123',
  })
  id: string;

  @ApiProperty({
    description: 'Theme name',
    example: 'LLM',
  })
  name: string;

  @ApiProperty({
    description: 'Theme description',
    example: 'Large language models',
  })
  description: string;

  @ApiProperty({
    description: 'Theme strategies',
    type: [Object],
  })
  strategies: { id: string; name: string }[];

  @ApiProperty({
    description: 'Theme creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  static mapFromEntity(e: ThemeEntity): ThemeDto {
    return {
      id: e.id,
      name: e.name,
      strategies: e.strategies?.map((i) => ({
        id: i.strategy.id,
        name: i.strategy.name,
      })),
      description: e.description,
      createdAt: e.createdAt,
    };
  }
}

export class ThemeWithRecentPostsCountDto extends ThemeDto {
  @ApiProperty({
    description: 'Number of recent posts',
    example: 3,
  })
  recentPostsCount: number;

  static mapFromEntity(e: any): ThemeWithRecentPostsCountDto {
    return {
      ...super.mapFromEntity(e),
      recentPostsCount: e.recentPostsCount,
    };
  }
}

export class ThemeDetailsDto extends ThemeDto {
  static mapFromEntity(e: any): ThemeDetailsDto {
    return {
      ...super.mapFromEntity(e),
    };
  }
}

export class ThemeDetailsWithRecentPostsDto extends ThemeDetailsDto {
  @ApiProperty({
    description: 'Recent posts',
    type: [PostDto],
  })
  recentPosts: PostDto[];

  static mapFromEntity(
    e: ThemeEntity & { recentPosts: PostEntity[] },
  ): ThemeDetailsWithRecentPostsDto {
    return {
      ...super.mapFromEntity(e),
      recentPosts: e.recentPosts.map((i) => PostDto.mapFromEntity(i)),
    };
  }
}
