import { MigrationInterface, QueryRunner } from 'typeorm';

export class Voice1776822532986 implements MigrationInterface {
  name = 'Voice1776822532986';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "strategy" DROP CONSTRAINT "FK_fe7c32ffb224ab06e3645cf5d2e"
        `);
    await queryRunner.query(`
            ALTER TABLE "post" DROP CONSTRAINT "FK_d71267a40b11eac9c6b2dee9019"
        `);
    await queryRunner.query(`
            ALTER TABLE "idea" DROP CONSTRAINT "FK_e52fbfc9918ddce8e0e067ff129"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_strategy_profile"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_post_profile"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_idea_profile"
        `);
    await queryRunner.query(`
            ALTER TABLE "strategy"
                RENAME COLUMN "profile_id" TO "voice_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "post"
                RENAME COLUMN "profile_id" TO "voice_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "idea"
                RENAME COLUMN "profile_id" TO "voice_id"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."platform_type_enum" AS ENUM(
                'telegram',
                'x',
                'threads',
                'linkedin',
                'instagram',
                'tiktok',
                'youtube',
                'facebook',
                'newsletter',
                'blog',
                'substack',
                'medium',
                'reddit',
                'discord',
                'custom'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "voice_example" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "textEmbeddings" vector(1536) NOT NULL,
                "text" text NOT NULL,
                "platform" "public"."platform_type_enum" NOT NULL,
                "voice_id" uuid NOT NULL,
                CONSTRAINT "PK_742c09a4fc96c83bbcdaf2b7e58" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_69841b26af7a4cc0938914dcc3" ON "voice_example" ("createdAt")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_voice_example_voice" ON "voice_example" ("voice_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "voice" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "name" character varying(255) NOT NULL,
                "rules" jsonb NOT NULL,
                "avoidRules" jsonb,
                "tov" jsonb,
                "evidencePreferences" text,
                "platforms" "public"."platform_type_enum" array NOT NULL DEFAULT '{}',
                "platformOverrides" jsonb,
                "user_id" uuid NOT NULL,
                CONSTRAINT "PK_4dbff4827c3260aa4ffa68638f6" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_f3c5b9b59104bf291cc8fdb9e1" ON "voice" ("createdAt")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_voice_user" ON "voice" ("user_id")
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."post_platform_enum"
            RENAME TO "post_platform_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "post"
            ALTER COLUMN "platform" TYPE "public"."platform_type_enum" USING "platform"::"text"::"public"."platform_type_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."post_platform_enum_old"
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_strategy_voice" ON "strategy" ("voice_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_post_voice" ON "post" ("voice_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_idea_voice" ON "idea" ("voice_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "voice_example"
            ADD CONSTRAINT "FK_6a945f24710b34929d6f68d5773" FOREIGN KEY ("voice_id") REFERENCES "voice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "voice"
            ADD CONSTRAINT "FK_5db8c7eff16870fe5d2e827c12c" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "strategy"
            ADD CONSTRAINT "FK_50a7a9414ca1a9f32f760498c9d" FOREIGN KEY ("voice_id") REFERENCES "voice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "post"
            ADD CONSTRAINT "FK_de7784b4aee6ef3c61557bdb3b0" FOREIGN KEY ("voice_id") REFERENCES "voice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "idea"
            ADD CONSTRAINT "FK_df9354fe917612b85ed2bdba0a0" FOREIGN KEY ("voice_id") REFERENCES "voice"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "idea" DROP CONSTRAINT "FK_df9354fe917612b85ed2bdba0a0"
        `);
    await queryRunner.query(`
            ALTER TABLE "post" DROP CONSTRAINT "FK_de7784b4aee6ef3c61557bdb3b0"
        `);
    await queryRunner.query(`
            ALTER TABLE "strategy" DROP CONSTRAINT "FK_50a7a9414ca1a9f32f760498c9d"
        `);
    await queryRunner.query(`
            ALTER TABLE "voice" DROP CONSTRAINT "FK_5db8c7eff16870fe5d2e827c12c"
        `);
    await queryRunner.query(`
            ALTER TABLE "voice_example" DROP CONSTRAINT "FK_6a945f24710b34929d6f68d5773"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_idea_voice"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_post_voice"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_strategy_voice"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."post_platform_enum_old" AS ENUM(
                'telegram',
                'x',
                'threads',
                'linkedin',
                'instagram',
                'tiktok',
                'youtube',
                'facebook',
                'newsletter',
                'blog',
                'substack',
                'medium',
                'reddit',
                'discord',
                'custom'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "post"
            ALTER COLUMN "platform" TYPE "public"."post_platform_enum_old" USING "platform"::"text"::"public"."post_platform_enum_old"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."platform_type_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."post_platform_enum_old"
            RENAME TO "post_platform_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_voice_user"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_f3c5b9b59104bf291cc8fdb9e1"
        `);
    await queryRunner.query(`
            DROP TABLE "voice"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."platform_type_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_voice_example_voice"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_69841b26af7a4cc0938914dcc3"
        `);
    await queryRunner.query(`
            DROP TABLE "voice_example"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."platform_type_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "idea"
                RENAME COLUMN "voice_id" TO "profile_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "post"
                RENAME COLUMN "voice_id" TO "profile_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "strategy"
                RENAME COLUMN "voice_id" TO "profile_id"
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_idea_profile" ON "idea" ("profile_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_post_profile" ON "post" ("profile_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_strategy_profile" ON "strategy" ("profile_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "idea"
            ADD CONSTRAINT "FK_e52fbfc9918ddce8e0e067ff129" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "post"
            ADD CONSTRAINT "FK_d71267a40b11eac9c6b2dee9019" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "strategy"
            ADD CONSTRAINT "FK_fe7c32ffb224ab06e3645cf5d2e" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
