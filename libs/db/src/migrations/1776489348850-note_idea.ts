import { MigrationInterface, QueryRunner } from "typeorm";

export class NoteIdea1776489348850 implements MigrationInterface {
    name = 'NoteIdea1776489348850'

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
