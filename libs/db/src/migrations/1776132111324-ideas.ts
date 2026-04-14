import { MigrationInterface, QueryRunner } from "typeorm";

export class Ideas1776132111324 implements MigrationInterface {
    name = 'Ideas1776132111324'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."idx_post_angle"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_post_type"
        `);
        await queryRunner.query(`
            CREATE TABLE "note_idea" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "note_id" uuid NOT NULL,
                "idea_id" uuid NOT NULL,
                "is_manual" boolean NOT NULL,
                CONSTRAINT "PK_16232637583ce2e0313d67a00ee" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9a09f2b57e4d9329b8652aed56" ON "note_idea" ("createdAt")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_note_idea_note" ON "note_idea" ("note_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_note_idea_idea" ON "note_idea" ("idea_id")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_unique_note_idea" ON "note_idea" ("note_id", "idea_id")
            WHERE "deletedAt" IS NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "post" DROP COLUMN "angle_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "post" DROP COLUMN "post_type"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."post_post_type_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "post" DROP COLUMN "generation_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "profile"
            ADD "isDefault" boolean NOT NULL DEFAULT true
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD "idea_id" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "idea"
            ADD "strategy_id" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "idea"
            ADD "theme_id" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "idea"
            ADD "profile_id" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "idea"
            ADD "user_id" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "post" DROP CONSTRAINT "FK_1c5b04ead6efddf1d873b64dae3"
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ALTER COLUMN "theme_id" DROP NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_post_idea" ON "post" ("idea_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_note_strategy" ON "idea" ("strategy_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_idea_theme" ON "idea" ("theme_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_idea_profile" ON "idea" ("profile_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_idea_user" ON "idea" ("user_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD CONSTRAINT "FK_f87f1520bb3961507e4a919dcdf" FOREIGN KEY ("idea_id") REFERENCES "idea"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD CONSTRAINT "FK_1c5b04ead6efddf1d873b64dae3" FOREIGN KEY ("theme_id") REFERENCES "theme"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "note_idea"
            ADD CONSTRAINT "FK_aba4a28cc0abf111598f44aeb0e" FOREIGN KEY ("note_id") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "note_idea"
            ADD CONSTRAINT "FK_dc78e980d16e0590eef2f97b8d4" FOREIGN KEY ("idea_id") REFERENCES "idea"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
        await queryRunner.query(`
            ALTER TABLE "idea"
            ADD CONSTRAINT "FK_abd4e09faa9a88e2171e9cc958f" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "idea" DROP CONSTRAINT "FK_abd4e09faa9a88e2171e9cc958f"
        `);
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
            ALTER TABLE "note_idea" DROP CONSTRAINT "FK_dc78e980d16e0590eef2f97b8d4"
        `);
        await queryRunner.query(`
            ALTER TABLE "note_idea" DROP CONSTRAINT "FK_aba4a28cc0abf111598f44aeb0e"
        `);
        await queryRunner.query(`
            ALTER TABLE "post" DROP CONSTRAINT "FK_1c5b04ead6efddf1d873b64dae3"
        `);
        await queryRunner.query(`
            ALTER TABLE "post" DROP CONSTRAINT "FK_f87f1520bb3961507e4a919dcdf"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_idea_user"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_idea_profile"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_idea_theme"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_note_strategy"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_post_idea"
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ALTER COLUMN "theme_id"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD CONSTRAINT "FK_1c5b04ead6efddf1d873b64dae3" FOREIGN KEY ("theme_id") REFERENCES "theme"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "idea" DROP COLUMN "user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "idea" DROP COLUMN "profile_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "idea" DROP COLUMN "theme_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "idea" DROP COLUMN "strategy_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "post" DROP COLUMN "idea_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "profile" DROP COLUMN "isDefault"
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD "generation_id" uuid
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."post_post_type_enum" AS ENUM('summary', 'opinion', 'howto', 'news')
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD "post_type" "public"."post_post_type_enum" NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD "angle_id" uuid
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_unique_note_idea"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_note_idea_idea"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_note_idea_note"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_9a09f2b57e4d9329b8652aed56"
        `);
        await queryRunner.query(`
            DROP TABLE "note_idea"
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_post_type" ON "post" ("post_type")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_post_angle" ON "post" ("angle_id")
        `);
    }

}
