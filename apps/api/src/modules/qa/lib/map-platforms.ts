import { PlatformType } from '@app/db';

const PLATFORM_ALIASES: Record<string, PlatformType> = {
  telegram: PlatformType.Telegram,
  x: PlatformType.X,
  twitter: PlatformType.X,
  threads: PlatformType.Threads,
  linkedin: PlatformType.LinkedIn,
  instagram: PlatformType.Instagram,
  ig: PlatformType.Instagram,
  tiktok: PlatformType.TikTok,
  youtube: PlatformType.YouTube,
  facebook: PlatformType.Facebook,
  newsletter: PlatformType.Newsletter,
  blog: PlatformType.Blog,
  substack: PlatformType.Substack,
  medium: PlatformType.Medium,
  reddit: PlatformType.Reddit,
  discord: PlatformType.Discord,
};

export function mapPlatforms(values: unknown): PlatformType[] {
  if (!Array.isArray(values)) {
    return [PlatformType.LinkedIn];
  }

  const mapped = values
    .map((value) =>
      typeof value === 'string'
        ? PLATFORM_ALIASES[value.trim().toLowerCase()]
        : undefined,
    )
    .filter((value): value is PlatformType => Boolean(value));

  return mapped.length ? [...new Set(mapped)] : [PlatformType.LinkedIn];
}
