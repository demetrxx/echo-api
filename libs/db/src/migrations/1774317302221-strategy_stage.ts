import { MigrationInterface, QueryRunner } from "typeorm";

export class StrategyStage1774317302221 implements MigrationInterface {
    name = 'StrategyStage1774317302221'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."strategy_stage_enum" AS ENUM(
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
            ADD "stage" "public"."strategy_stage_enum" NOT NULL DEFAULT 'rapport'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "strategy" DROP COLUMN "stage"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."strategy_stage_enum"
        `);
    }

}
