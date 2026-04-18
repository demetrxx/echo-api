import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1776489315442 implements MigrationInterface {
    name = 'Migrations1776489315442'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "note_idea" DROP COLUMN "is_manual"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "note_idea"
            ADD "is_manual" boolean NOT NULL
        `);
    }

}
