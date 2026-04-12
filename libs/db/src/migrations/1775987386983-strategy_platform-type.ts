import { MigrationInterface, QueryRunner } from "typeorm";

export class StrategyPlatformType1775987386983 implements MigrationInterface {
    name = 'StrategyPlatformType1775987386983'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "strategy" DROP COLUMN "completenessLevel"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."strategy_completenesslevel_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."post_platform_enum"
            RENAME TO "post_platform_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."post_platform_enum" AS ENUM(
                'telegram',
                'x',
                'threads',
                'linkedin',
                'instagram',
                'tiktok',
                'youtube',
                'facebook',
                'newsletter',
                'blog',
                'substack',
                'medium',
                'reddit',
                'discord',
                'custom'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ALTER COLUMN "platform" TYPE "public"."post_platform_enum" USING "platform"::"text"::"public"."post_platform_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."post_platform_enum_old"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."post_platform_enum_old" AS ENUM(
                'telegram',
                'x',
                'linkedin',
                'instagram',
                'facebook',
                'newsletter',
                'blog',
                'custom'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ALTER COLUMN "platform" TYPE "public"."post_platform_enum_old" USING "platform"::"text"::"public"."post_platform_enum_old"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."post_platform_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."post_platform_enum_old"
            RENAME TO "post_platform_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."strategy_completenesslevel_enum" AS ENUM('minimal', 'refined', 'advanced')
        `);
        await queryRunner.query(`
            ALTER TABLE "strategy"
            ADD "completenessLevel" "public"."strategy_completenesslevel_enum" NOT NULL DEFAULT 'minimal'
        `);
    }

}
