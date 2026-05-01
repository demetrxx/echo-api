import { MigrationInterface, QueryRunner } from "typeorm";

export class NoteTitle1777603727154 implements MigrationInterface {
    name = 'NoteTitle1777603727154'

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
