import { MigrationInterface, QueryRunner } from "typeorm";

export class FileOgName1773486017885 implements MigrationInterface {
    name = 'FileOgName1773486017885'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "file"
            ADD "ogName" character varying
        `);
        await queryRunner.query(`
            COMMENT ON COLUMN "file"."ogName" IS 'Original file name'
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
            COMMENT ON COLUMN "file"."ogName" IS 'Original file name'
        `);
        await queryRunner.query(`
            ALTER TABLE "file" DROP COLUMN "ogName"
        `);
    }

}
