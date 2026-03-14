import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1772868787473 implements MigrationInterface {
    name = 'Init1772868787473'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."file_status_enum" AS ENUM('PENDING', 'UPLOADED')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."file_dir_enum" AS ENUM('files')
        `);
        await queryRunner.query(`
            CREATE TABLE "file" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "status" "public"."file_status_enum" NOT NULL DEFAULT 'UPLOADED',
                "path" character varying NOT NULL,
                "url" character varying,
                "name" character varying NOT NULL,
                "mime" character varying NOT NULL,
                "dir" "public"."file_dir_enum" NOT NULL,
                CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "file"."status" IS 'Whether the file is pending upload or already uploaded';
            COMMENT ON COLUMN "file"."path" IS 'Path in S3 "<dirName>/<fileId>", e.g. /files/1234567890';
            COMMENT ON COLUMN "file"."url" IS 'Public URL of the file';
            COMMENT ON COLUMN "file"."name" IS 'Original file name';
            COMMENT ON COLUMN "file"."mime" IS 'MIME type of the file';
            COMMENT ON COLUMN "file"."dir" IS 'Directory in S3 where the file is stored'
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_18a0ad156828b598fcef570209" ON "file" ("createdAt")
        `);
        await queryRunner.query(`
            COMMENT ON TABLE "file" IS 'File stored in S3'
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."note_item_type_enum" AS ENUM('text', 'file', 'link', 'image', 'voice')
        `);
        await queryRunner.query(`
            CREATE TABLE "note_item" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "note_id" uuid NOT NULL,
                "type" "public"."note_item_type_enum" NOT NULL,
                "name" character varying(255),
                "value" text NOT NULL,
                "file_id" uuid,
                CONSTRAINT "PK_eeb5901759f08fdf8e4447fa86c" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_7a7abdfb5db68983b656b236f6" ON "note_item" ("createdAt")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_note_item_note" ON "note_item" ("note_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_note_item_file" ON "note_item" ("file_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "note" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "name" character varying(255),
                "user_id" uuid NOT NULL,
                CONSTRAINT "PK_96d0c172a4fba276b1bbed43058" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e7c0567f5261063592f022e9b5" ON "note" ("createdAt")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_note_user" ON "note" ("user_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."post_version_action_enum" AS ENUM('generate', 'regenerate', 'refine', 'edit')
        `);
        await queryRunner.query(`
            CREATE TABLE "post_version" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "post_id" uuid NOT NULL,
                "version_no" integer NOT NULL,
                "parent_version_no" integer,
                "action" "public"."post_version_action_enum" NOT NULL,
                "text" text NOT NULL,
                "intent" character varying(255),
                CONSTRAINT "PK_d2a12e95462e27dab16c6817381" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_d3dde44b94a207373921b3598e" ON "post_version" ("createdAt")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_post_version_post" ON "post_version" ("post_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "profile" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "user_id" uuid NOT NULL,
                "name" character varying(255) NOT NULL,
                "prompt" text,
                "tov" jsonb DEFAULT '[]',
                "examples" jsonb NOT NULL DEFAULT '[]',
                "isDefaultFor" jsonb NOT NULL DEFAULT '[]'::jsonb,
                CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_3b983631651f08d8b5b66a4e1f" ON "profile" ("createdAt")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_profile_user" ON "profile" ("user_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "theme" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "name" character varying(255) NOT NULL,
                "description" text,
                "user_id" uuid NOT NULL,
                CONSTRAINT "PK_c1934d0b4403bf10c1ab0c18166" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c83b6d5eb86c4eacfc73391f29" ON "theme" ("createdAt")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_theme_user" ON "theme" ("user_id")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_unique_theme_name" ON "theme" ("name", "user_id")
            WHERE "deletedAt" IS NULL
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."post_post_type_enum" AS ENUM('summary', 'opinion', 'howto', 'news')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."post_status_enum" AS ENUM(
                'generating',
                'failed',
                'draft',
                'final',
                'archived'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."post_platform_enum" AS ENUM('telegram', 'x', 'linkedin', 'instagram')
        `);
        await queryRunner.query(`
            CREATE TABLE "post" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "user_id" uuid NOT NULL,
                "theme_id" uuid NOT NULL,
                "angle_id" uuid,
                "profile_id" uuid,
                "post_type" "public"."post_post_type_enum" NOT NULL,
                "status" "public"."post_status_enum" NOT NULL DEFAULT 'draft',
                "title" character varying(255),
                "platform" "public"."post_platform_enum" NOT NULL,
                "current_version_id" uuid,
                "final_version_id" uuid,
                "generation_id" uuid,
                CONSTRAINT "REL_b8010a7dbdc048b55151cd4e44" UNIQUE ("final_version_id"),
                CONSTRAINT "REL_644034cfe400cf8d650bbc79c0" UNIQUE ("current_version_id"),
                CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_fb91bea2d37140a877b775e6b2" ON "post" ("createdAt")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_post_user" ON "post" ("user_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_post_theme" ON "post" ("theme_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_post_angle" ON "post" ("angle_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_post_profile" ON "post" ("profile_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_post_type" ON "post" ("post_type")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_post_status" ON "post" ("status")
        `);
        await queryRunner.query(`
            CREATE TABLE "refresh_session" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "token_hash" character varying(255) NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                "revoked_at" TIMESTAMP,
                "replaced_by_id" uuid,
                "user_agent" character varying(255),
                "ip" character varying(255),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_5d0d8c21064803b5b2baaa50cbb" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_refresh_session_token_hash" ON "refresh_session" ("token_hash")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_refresh_session_expires" ON "refresh_session" ("expires_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_refresh_session_user" ON "refresh_session" ("user_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "tg_user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "user_id" uuid NOT NULL,
                "telegram_username" character varying(255),
                "telegram_id" character varying(255),
                "active_note_id" uuid,
                "last_activity_at" TIMESTAMP,
                CONSTRAINT "UQ_b7e7df3e66c0c64799ae91f9471" UNIQUE ("telegram_username"),
                CONSTRAINT "UQ_256a98fa25aebf71b26d2450f8e" UNIQUE ("telegram_id"),
                CONSTRAINT "REL_9245905c01d98a6cdb11ceebb8" UNIQUE ("user_id"),
                CONSTRAINT "PK_82c400c2e87868c2772c6fbdba8" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_eaa29518cc259c6560519d0a16" ON "tg_user" ("createdAt")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."user_status_enum" AS ENUM('active', 'inactive')
        `);
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "firstName" character varying(255),
                "lastName" character varying(255),
                "email" character varying(255) NOT NULL,
                "languageCode" character varying(255),
                "password_hash" character varying(255),
                "status" "public"."user_status_enum" NOT NULL DEFAULT 'active',
                "email_confirmed" boolean NOT NULL DEFAULT false,
                "email_confirmed_at" TIMESTAMP,
                "last_activity_at" TIMESTAMP,
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e11e649824a45d8ed01d597fd9" ON "user" ("createdAt")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."auth_token_type_enum" AS ENUM('email_confirm', 'password_reset')
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_token" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "token_hash" character varying(255) NOT NULL,
                "type" "public"."auth_token_type_enum" NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                "used_at" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_4572ff5d1264c4a523f01aa86a0" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_auth_token_hash" ON "auth_token" ("token_hash")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_auth_token_type" ON "auth_token" ("type")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_auth_token_user" ON "auth_token" ("user_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "note_item"
            ADD CONSTRAINT "FK_7a12abf5cc331594fcfe6e1e92e" FOREIGN KEY ("note_id") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "note_item"
            ADD CONSTRAINT "FK_9672035478b63ea6b833b33acff" FOREIGN KEY ("file_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "note"
            ADD CONSTRAINT "FK_654d6da35fcab12c3905725a416" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "post_version"
            ADD CONSTRAINT "FK_198319c7e8f1c7f9855d57a6889" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "profile"
            ADD CONSTRAINT "FK_d752442f45f258a8bdefeebb2f2" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "theme"
            ADD CONSTRAINT "FK_8fa0b204a23059c031e60f6a3a8" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD CONSTRAINT "FK_52378a74ae3724bcab44036645b" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD CONSTRAINT "FK_1c5b04ead6efddf1d873b64dae3" FOREIGN KEY ("theme_id") REFERENCES "theme"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD CONSTRAINT "FK_d71267a40b11eac9c6b2dee9019" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD CONSTRAINT "FK_b8010a7dbdc048b55151cd4e445" FOREIGN KEY ("final_version_id") REFERENCES "post_version"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD CONSTRAINT "FK_644034cfe400cf8d650bbc79c08" FOREIGN KEY ("current_version_id") REFERENCES "post_version"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "refresh_session"
            ADD CONSTRAINT "FK_684b73eb2dd26a45b1fdc0ca178" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "tg_user"
            ADD CONSTRAINT "FK_9245905c01d98a6cdb11ceebb85" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_token"
            ADD CONSTRAINT "FK_26b580c89e141c75426f44317bc" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "auth_token" DROP CONSTRAINT "FK_26b580c89e141c75426f44317bc"
        `);
        await queryRunner.query(`
            ALTER TABLE "tg_user" DROP CONSTRAINT "FK_9245905c01d98a6cdb11ceebb85"
        `);
        await queryRunner.query(`
            ALTER TABLE "refresh_session" DROP CONSTRAINT "FK_684b73eb2dd26a45b1fdc0ca178"
        `);
        await queryRunner.query(`
            ALTER TABLE "post" DROP CONSTRAINT "FK_644034cfe400cf8d650bbc79c08"
        `);
        await queryRunner.query(`
            ALTER TABLE "post" DROP CONSTRAINT "FK_b8010a7dbdc048b55151cd4e445"
        `);
        await queryRunner.query(`
            ALTER TABLE "post" DROP CONSTRAINT "FK_d71267a40b11eac9c6b2dee9019"
        `);
        await queryRunner.query(`
            ALTER TABLE "post" DROP CONSTRAINT "FK_1c5b04ead6efddf1d873b64dae3"
        `);
        await queryRunner.query(`
            ALTER TABLE "post" DROP CONSTRAINT "FK_52378a74ae3724bcab44036645b"
        `);
        await queryRunner.query(`
            ALTER TABLE "theme" DROP CONSTRAINT "FK_8fa0b204a23059c031e60f6a3a8"
        `);
        await queryRunner.query(`
            ALTER TABLE "profile" DROP CONSTRAINT "FK_d752442f45f258a8bdefeebb2f2"
        `);
        await queryRunner.query(`
            ALTER TABLE "post_version" DROP CONSTRAINT "FK_198319c7e8f1c7f9855d57a6889"
        `);
        await queryRunner.query(`
            ALTER TABLE "note" DROP CONSTRAINT "FK_654d6da35fcab12c3905725a416"
        `);
        await queryRunner.query(`
            ALTER TABLE "note_item" DROP CONSTRAINT "FK_9672035478b63ea6b833b33acff"
        `);
        await queryRunner.query(`
            ALTER TABLE "note_item" DROP CONSTRAINT "FK_7a12abf5cc331594fcfe6e1e92e"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_auth_token_user"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_auth_token_type"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_auth_token_hash"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_token"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."auth_token_type_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e11e649824a45d8ed01d597fd9"
        `);
        await queryRunner.query(`
            DROP TABLE "user"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."user_status_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_eaa29518cc259c6560519d0a16"
        `);
        await queryRunner.query(`
            DROP TABLE "tg_user"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_refresh_session_user"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_refresh_session_expires"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_refresh_session_token_hash"
        `);
        await queryRunner.query(`
            DROP TABLE "refresh_session"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_post_status"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_post_type"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_post_profile"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_post_angle"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_post_theme"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_post_user"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_fb91bea2d37140a877b775e6b2"
        `);
        await queryRunner.query(`
            DROP TABLE "post"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."post_platform_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."post_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."post_post_type_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_unique_theme_name"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_theme_user"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_c83b6d5eb86c4eacfc73391f29"
        `);
        await queryRunner.query(`
            DROP TABLE "theme"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_profile_user"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_3b983631651f08d8b5b66a4e1f"
        `);
        await queryRunner.query(`
            DROP TABLE "profile"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_post_version_post"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_d3dde44b94a207373921b3598e"
        `);
        await queryRunner.query(`
            DROP TABLE "post_version"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."post_version_action_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_note_user"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e7c0567f5261063592f022e9b5"
        `);
        await queryRunner.query(`
            DROP TABLE "note"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_note_item_file"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_note_item_note"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_7a7abdfb5db68983b656b236f6"
        `);
        await queryRunner.query(`
            DROP TABLE "note_item"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."note_item_type_enum"
        `);
        await queryRunner.query(`
            COMMENT ON TABLE "file" IS NULL
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_18a0ad156828b598fcef570209"
        `);
        await queryRunner.query(`
            DROP TABLE "file"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."file_dir_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."file_status_enum"
        `);
    }

}
