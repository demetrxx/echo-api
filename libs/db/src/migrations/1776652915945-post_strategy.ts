import { MigrationInterface, QueryRunner } from "typeorm";

export class PostStrategy1776652915945 implements MigrationInterface {
    name = 'PostStrategy1776652915945'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD "strategy_id" uuid
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_post_strategy" ON "post" ("strategy_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD CONSTRAINT "FK_80c423ae67925d1f028944a0d2a" FOREIGN KEY ("strategy_id") REFERENCES "strategy"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "post" DROP CONSTRAINT "FK_80c423ae67925d1f028944a0d2a"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_post_strategy"
        `);
        await queryRunner.query(`
            ALTER TABLE "post" DROP COLUMN "strategy_id"
        `);
    }

}
