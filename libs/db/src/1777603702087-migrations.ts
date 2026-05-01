import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1777603702087 implements MigrationInterface {
    name = 'Migrations1777603702087'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "note"
            ADD "generating_title" boolean NOT NULL DEFAULT false
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "note" DROP COLUMN "generating_title"
        `);
    }

}
