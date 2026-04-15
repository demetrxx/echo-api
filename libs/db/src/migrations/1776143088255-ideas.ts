import { MigrationInterface, QueryRunner } from "typeorm";

export class Ideas1776143088255 implements MigrationInterface {
    name = 'Ideas1776143088255'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "idea" DROP CONSTRAINT "FK_401af779b993dc6e34a55b7f1d1"
        `);
        await queryRunner.query(`
            ALTER TABLE "idea" DROP CONSTRAINT "FK_fb2e70af345963ef18591760f93"
        `);
        await queryRunner.query(`
            ALTER TABLE "idea" DROP CONSTRAINT "FK_e52fbfc9918ddce8e0e067ff129"
        `);
        await queryRunner.query(`
            ALTER TABLE "idea"
            ALTER COLUMN "strategy_id" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "idea"
            ALTER COLUMN "theme_id" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "idea"
            ALTER COLUMN "profile_id" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "idea"
            ADD CONSTRAINT "FK_401af779b993dc6e34a55b7f1d1" FOREIGN KEY ("strategy_id") REFERENCES "strategy"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "idea"
            ADD CONSTRAINT "FK_fb2e70af345963ef18591760f93" FOREIGN KEY ("theme_id") REFERENCES "theme"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "idea"
            ADD CONSTRAINT "FK_e52fbfc9918ddce8e0e067ff129" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "idea" DROP CONSTRAINT "FK_e52fbfc9918ddce8e0e067ff129"
        `);
        await queryRunner.query(`
            ALTER TABLE "idea" DROP CONSTRAINT "FK_fb2e70af345963ef18591760f93"
        `);
        await queryRunner.query(`
            ALTER TABLE "idea" DROP CONSTRAINT "FK_401af779b993dc6e34a55b7f1d1"
        `);
        await queryRunner.query(`
            ALTER TABLE "idea"
            ALTER COLUMN "profile_id"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "idea"
            ALTER COLUMN "theme_id"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "idea"
            ALTER COLUMN "strategy_id"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "idea"
            ADD CONSTRAINT "FK_e52fbfc9918ddce8e0e067ff129" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "idea"
            ADD CONSTRAINT "FK_fb2e70af345963ef18591760f93" FOREIGN KEY ("theme_id") REFERENCES "theme"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "idea"
            ADD CONSTRAINT "FK_401af779b993dc6e34a55b7f1d1" FOREIGN KEY ("strategy_id") REFERENCES "strategy"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    }

}
