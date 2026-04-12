import { MigrationInterface, QueryRunner } from "typeorm";

export class StrategyV21775979295659 implements MigrationInterface {
    name = 'StrategyV21775979295659'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "profile"
            ADD "evidencePreferences" text
        `);
        await queryRunner.query(`
            ALTER TABLE "profile"
            ADD "anglePreferences" text
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."strategy_stage_enum"
            RENAME TO "strategy_stage_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."strategy_stage_enum" AS ENUM(
                'diagnose',
                'context',
                'direction',
                'themes',
                'voice',
                'sharpen',
                'free_refine'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "strategy"
            ALTER COLUMN "stage" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "strategy"
            ALTER COLUMN "stage" TYPE "public"."strategy_stage_enum" USING "stage"::"text"::"public"."strategy_stage_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "strategy"
            ALTER COLUMN "stage"
            SET DEFAULT 'diagnose'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."strategy_stage_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "profile"
            ALTER COLUMN "tov" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."post_platform_enum"
            RENAME TO "post_platform_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."post_platform_enum" AS ENUM(
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
            ALTER COLUMN "platform" TYPE "public"."post_platform_enum" USING "platform"::"text"::"public"."post_platform_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."post_platform_enum_old"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."post_platform_enum_old" AS ENUM('telegram', 'x', 'linkedin', 'instagram')
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
            ALTER TABLE "profile"
            ALTER COLUMN "tov"
            SET DEFAULT '[]'
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."strategy_stage_enum_old" AS ENUM(
                'rapport',
                'inventory',
                'distillation',
                'structuring',
                'tension_check',
                'readiness',
                'handoff',
                'free_refine'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "strategy"
            ALTER COLUMN "stage" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "strategy"
            ALTER COLUMN "stage" TYPE "public"."strategy_stage_enum_old" USING "stage"::"text"::"public"."strategy_stage_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "strategy"
            ALTER COLUMN "stage"
            SET DEFAULT 'rapport'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."strategy_stage_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."strategy_stage_enum_old"
            RENAME TO "strategy_stage_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "profile" DROP COLUMN "anglePreferences"
        `);
        await queryRunner.query(`
            ALTER TABLE "profile" DROP COLUMN "evidencePreferences"
        `);
    }

}
