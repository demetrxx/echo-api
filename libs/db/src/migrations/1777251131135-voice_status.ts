import { MigrationInterface, QueryRunner } from "typeorm";

export class VoiceStatus1777251131135 implements MigrationInterface {
    name = 'VoiceStatus1777251131135'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TYPE "public"."voice_status_enum"
            RENAME TO "voice_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."voice_status_enum" AS ENUM('created', 'calibrating', 'active')
        `);
        await queryRunner.query(`
            ALTER TABLE "voice"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "voice"
            ALTER COLUMN "status" TYPE "public"."voice_status_enum" USING "status"::"text"::"public"."voice_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "voice"
            ALTER COLUMN "status"
            SET DEFAULT 'calibrating'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."voice_status_enum_old"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."voice_status_enum_old" AS ENUM('calibrating', 'active')
        `);
        await queryRunner.query(`
            ALTER TABLE "voice"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "voice"
            ALTER COLUMN "status" TYPE "public"."voice_status_enum_old" USING "status"::"text"::"public"."voice_status_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "voice"
            ALTER COLUMN "status"
            SET DEFAULT 'calibrating'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."voice_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."voice_status_enum_old"
            RENAME TO "voice_status_enum"
        `);
    }

}
