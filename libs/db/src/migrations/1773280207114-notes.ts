import { MigrationInterface, QueryRunner } from "typeorm";

export class Notes1773280207114 implements MigrationInterface {
    name = 'Notes1773280207114'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "note_item" DROP COLUMN "name"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."note_item_status_enum" AS ENUM('pending', 'processed', 'failed')
        `);
        await queryRunner.query(`
            ALTER TABLE "note_item"
            ADD "status" "public"."note_item_status_enum" NOT NULL DEFAULT 'pending'
        `);
        await queryRunner.query(`
            ALTER TABLE "note_item"
            ADD "meta" jsonb
        `);
        await queryRunner.query(`
            ALTER TABLE "note"
            ADD "text" text NOT NULL DEFAULT ''
        `);
        await queryRunner.query(`
            ALTER TABLE "note_item"
            ALTER COLUMN "value" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "profile"
            ALTER COLUMN "isDefaultFor"
            SET DEFAULT '[]'::jsonb
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "profile"
            ALTER COLUMN "isDefaultFor"
            SET DEFAULT '[]'
        `);
        await queryRunner.query(`
            ALTER TABLE "note_item"
            ALTER COLUMN "value"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "note" DROP COLUMN "text"
        `);
        await queryRunner.query(`
            ALTER TABLE "note_item" DROP COLUMN "meta"
        `);
        await queryRunner.query(`
            ALTER TABLE "note_item" DROP COLUMN "status"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."note_item_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "note_item"
            ADD "name" character varying(255)
        `);
    }

}
