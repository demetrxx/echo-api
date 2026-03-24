import { MigrationInterface, QueryRunner } from "typeorm";

export class Strategy1774316307593 implements MigrationInterface {
    name = 'Strategy1774316307593'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "strategy_conversation" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "strategy_id" uuid NOT NULL,
                "history" jsonb NOT NULL,
                CONSTRAINT "REL_07e85cabc31ea74910973a616d" UNIQUE ("strategy_id"),
                CONSTRAINT "PK_e571ae798af2ff59e28c0bcfc4d" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b071b18eca94a17de58854eaec" ON "strategy_conversation" ("createdAt")
        `);
        await queryRunner.query(`
            CREATE TABLE "strategy_theme" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "strategy_id" uuid NOT NULL,
                "theme_id" uuid NOT NULL,
                CONSTRAINT "PK_a14748a801e4774c70cdc7a6e9c" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ab6278a5f9dc0c80618438af9e" ON "strategy_theme" ("createdAt")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_strategy_theme_strategy" ON "strategy_theme" ("strategy_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_strategy_theme_theme" ON "strategy_theme" ("theme_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."strategy_status_enum" AS ENUM('draft', 'active', 'archived')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."strategy_completenesslevel_enum" AS ENUM('minimal', 'refined', 'advanced')
        `);
        await queryRunner.query(`
            CREATE TABLE "strategy" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "name" character varying(255),
                "status" "public"."strategy_status_enum" NOT NULL DEFAULT 'draft',
                "completenessLevel" "public"."strategy_completenesslevel_enum" NOT NULL DEFAULT 'minimal',
                "snapshot" jsonb NOT NULL,
                "user_id" uuid NOT NULL,
                "profile_id" uuid,
                CONSTRAINT "PK_733d2c3d4a73c020375b9b3581d" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_5b80c8d08193851b2445de8087" ON "strategy" ("createdAt")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_strategy_user" ON "strategy" ("user_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_strategy_profile" ON "strategy" ("profile_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "note_theme" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "note_id" uuid NOT NULL,
                "theme_id" uuid NOT NULL,
                "is_manual" boolean NOT NULL,
                CONSTRAINT "PK_de26068e5a8a5f9b6387e7d9aca" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_0b3e873c3c330d505cd29f0b6b" ON "note_theme" ("createdAt")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_note_theme_note" ON "note_theme" ("note_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_note_theme_theme" ON "note_theme" ("theme_id")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_unique_note_theme" ON "note_theme" ("note_id", "theme_id")
            WHERE "deletedAt" IS NULL
        `);
        await queryRunner.query(`
            CREATE TABLE "idea" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "name" character varying(255) NOT NULL,
                "angle" character varying(255),
                CONSTRAINT "PK_5096f543c484b349f5234da9d97" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_88184b915f53dc033ca89cdb20" ON "idea" ("createdAt")
        `);
        await queryRunner.query(`
            ALTER TABLE "profile" DROP COLUMN "prompt"
        `);
        await queryRunner.query(`
            ALTER TABLE "profile" DROP COLUMN "isDefaultFor"
        `);
        await queryRunner.query(`
            ALTER TABLE "profile"
            ADD "rules" jsonb NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "profile"
            ADD "avoidRules" jsonb
        `);
        await queryRunner.query(`
            ALTER TABLE "profile"
            ADD "examplesSummary" text
        `);
        await queryRunner.query(`
            ALTER TABLE "theme"
            ADD "clean_name" character varying(255) NOT NULL
        `);
        await queryRunner.query(`
            COMMENT ON COLUMN "theme"."clean_name" IS 'System-generated clean name for the theme (lowercase, no spaces, special characters)'
        `);
        await queryRunner.query(`
            ALTER TABLE "note"
            ADD "should_suggest_themes" boolean NOT NULL DEFAULT true
        `);
        await queryRunner.query(`
            ALTER TABLE "strategy_conversation"
            ADD CONSTRAINT "FK_07e85cabc31ea74910973a616dd" FOREIGN KEY ("strategy_id") REFERENCES "strategy"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "strategy_theme"
            ADD CONSTRAINT "FK_50218350f36e0f67236f4ca7e6c" FOREIGN KEY ("strategy_id") REFERENCES "strategy"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "strategy_theme"
            ADD CONSTRAINT "FK_f45325997eb4bcb9d6d2a50fb67" FOREIGN KEY ("theme_id") REFERENCES "theme"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "strategy"
            ADD CONSTRAINT "FK_79298c225fd2f9f984de960e2fb" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "strategy"
            ADD CONSTRAINT "FK_fe7c32ffb224ab06e3645cf5d2e" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "note_theme"
            ADD CONSTRAINT "FK_ea8eef395425b54e72e9cf53049" FOREIGN KEY ("note_id") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "note_theme"
            ADD CONSTRAINT "FK_e25ab0d70623e5da1f7ba4f4bf8" FOREIGN KEY ("theme_id") REFERENCES "theme"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "note_theme" DROP CONSTRAINT "FK_e25ab0d70623e5da1f7ba4f4bf8"
        `);
        await queryRunner.query(`
            ALTER TABLE "note_theme" DROP CONSTRAINT "FK_ea8eef395425b54e72e9cf53049"
        `);
        await queryRunner.query(`
            ALTER TABLE "strategy" DROP CONSTRAINT "FK_fe7c32ffb224ab06e3645cf5d2e"
        `);
        await queryRunner.query(`
            ALTER TABLE "strategy" DROP CONSTRAINT "FK_79298c225fd2f9f984de960e2fb"
        `);
        await queryRunner.query(`
            ALTER TABLE "strategy_theme" DROP CONSTRAINT "FK_f45325997eb4bcb9d6d2a50fb67"
        `);
        await queryRunner.query(`
            ALTER TABLE "strategy_theme" DROP CONSTRAINT "FK_50218350f36e0f67236f4ca7e6c"
        `);
        await queryRunner.query(`
            ALTER TABLE "strategy_conversation" DROP CONSTRAINT "FK_07e85cabc31ea74910973a616dd"
        `);
        await queryRunner.query(`
            ALTER TABLE "note" DROP COLUMN "should_suggest_themes"
        `);
        await queryRunner.query(`
            COMMENT ON COLUMN "theme"."clean_name" IS 'System-generated clean name for the theme (lowercase, no spaces, special characters)'
        `);
        await queryRunner.query(`
            ALTER TABLE "theme" DROP COLUMN "clean_name"
        `);
        await queryRunner.query(`
            ALTER TABLE "profile" DROP COLUMN "examplesSummary"
        `);
        await queryRunner.query(`
            ALTER TABLE "profile" DROP COLUMN "avoidRules"
        `);
        await queryRunner.query(`
            ALTER TABLE "profile" DROP COLUMN "rules"
        `);
        await queryRunner.query(`
            ALTER TABLE "profile"
            ADD "isDefaultFor" jsonb NOT NULL DEFAULT '[]'
        `);
        await queryRunner.query(`
            ALTER TABLE "profile"
            ADD "prompt" text
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_88184b915f53dc033ca89cdb20"
        `);
        await queryRunner.query(`
            DROP TABLE "idea"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_unique_note_theme"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_note_theme_theme"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_note_theme_note"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_0b3e873c3c330d505cd29f0b6b"
        `);
        await queryRunner.query(`
            DROP TABLE "note_theme"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_strategy_profile"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_strategy_user"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_5b80c8d08193851b2445de8087"
        `);
        await queryRunner.query(`
            DROP TABLE "strategy"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."strategy_completenesslevel_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."strategy_status_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_strategy_theme_theme"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_strategy_theme_strategy"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ab6278a5f9dc0c80618438af9e"
        `);
        await queryRunner.query(`
            DROP TABLE "strategy_theme"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b071b18eca94a17de58854eaec"
        `);
        await queryRunner.query(`
            DROP TABLE "strategy_conversation"
        `);
    }

}
