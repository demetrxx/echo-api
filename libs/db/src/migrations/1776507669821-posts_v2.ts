import { MigrationInterface, QueryRunner } from "typeorm";

export class PostsV21776507669821 implements MigrationInterface {
    name = 'PostsV21776507669821'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "post_note" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "note_id" uuid NOT NULL,
                "post_id" uuid NOT NULL,
                CONSTRAINT "PK_b6298d5fdd7005024c6f4177255" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_69c18ea1e9cdf1bba89393a4e4" ON "post_note" ("createdAt")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_post_note_note" ON "post_note" ("note_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_post_note_post" ON "post_note" ("post_id")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_unique_post_note" ON "post_note" ("post_id", "note_id")
            WHERE "deletedAt" IS NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "post_version" DROP COLUMN "action"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."post_version_action_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "post_version" DROP COLUMN "intent"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."post_version_type_enum" AS ENUM('manual', 'ai')
        `);
        await queryRunner.query(`
            ALTER TABLE "post_version"
            ADD "type" "public"."post_version_type_enum" NOT NULL
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."post_status_enum"
            RENAME TO "post_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."post_status_enum" AS ENUM('draft', 'final', 'archived')
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ALTER COLUMN "status" TYPE "public"."post_status_enum" USING "status"::"text"::"public"."post_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ALTER COLUMN "status"
            SET DEFAULT 'draft'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."post_status_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "post_note"
            ADD CONSTRAINT "FK_3fb2bc448afc46ccde7c6e51d1a" FOREIGN KEY ("note_id") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "post_note"
            ADD CONSTRAINT "FK_aa9ba5bca793362010d5c8b7fc6" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "post_note" DROP CONSTRAINT "FK_aa9ba5bca793362010d5c8b7fc6"
        `);
        await queryRunner.query(`
            ALTER TABLE "post_note" DROP CONSTRAINT "FK_3fb2bc448afc46ccde7c6e51d1a"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."post_status_enum_old" AS ENUM(
                'generating',
                'failed',
                'draft',
                'final',
                'archived'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ALTER COLUMN "status" TYPE "public"."post_status_enum_old" USING "status"::"text"::"public"."post_status_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ALTER COLUMN "status"
            SET DEFAULT 'draft'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."post_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."post_status_enum_old"
            RENAME TO "post_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "post_version" DROP COLUMN "type"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."post_version_type_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "post_version"
            ADD "intent" character varying(255)
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."post_version_action_enum" AS ENUM('generate', 'regenerate', 'refine', 'edit')
        `);
        await queryRunner.query(`
            ALTER TABLE "post_version"
            ADD "action" "public"."post_version_action_enum" NOT NULL
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_unique_post_note"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_post_note_post"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_post_note_note"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_69c18ea1e9cdf1bba89393a4e4"
        `);
        await queryRunner.query(`
            DROP TABLE "post_note"
        `);
    }

}
