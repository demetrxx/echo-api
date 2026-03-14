import { MigrationInterface, QueryRunner } from "typeorm";

export class S3Dir1773462737431 implements MigrationInterface {
    name = 'S3Dir1773462737431'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TYPE "public"."file_dir_enum"
            RENAME TO "file_dir_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."file_dir_enum" AS ENUM('public', 'private')
        `);
        await queryRunner.query(`
            ALTER TABLE "file"
            ALTER COLUMN "dir" TYPE "public"."file_dir_enum" USING "dir"::"text"::"public"."file_dir_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."file_dir_enum_old"
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
            CREATE TYPE "public"."file_dir_enum_old" AS ENUM('files')
        `);
        await queryRunner.query(`
            ALTER TABLE "file"
            ALTER COLUMN "dir" TYPE "public"."file_dir_enum_old" USING "dir"::"text"::"public"."file_dir_enum_old"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."file_dir_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."file_dir_enum_old"
            RENAME TO "file_dir_enum"
        `);
    }

}
