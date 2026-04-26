import { MigrationInterface, QueryRunner } from "typeorm";

export class VoiceCalibration1777168097088 implements MigrationInterface {
    name = 'VoiceCalibration1777168097088'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "voice_calibration" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "voice_id" uuid NOT NULL,
                "data" jsonb NOT NULL,
                "note_id" uuid,
                CONSTRAINT "REL_c75da2e7f6ca6d50d8d0bb32da" UNIQUE ("voice_id"),
                CONSTRAINT "REL_7b073d1ba40b0c974cce6385ec" UNIQUE ("note_id"),
                CONSTRAINT "PK_3b27b525759c0d7b9cde5ee88bf" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_7dfc9e57f952e18e05d64ab964" ON "voice_calibration" ("createdAt")
        `);
        await queryRunner.query(`
            ALTER TABLE "voice" DROP COLUMN "rules"
        `);
        await queryRunner.query(`
            ALTER TABLE "voice" DROP COLUMN "avoidRules"
        `);
        await queryRunner.query(`
            ALTER TABLE "voice" DROP COLUMN "tov"
        `);
        await queryRunner.query(`
            ALTER TABLE "voice" DROP COLUMN "platformOverrides"
        `);
        await queryRunner.query(`
            ALTER TABLE "voice" DROP COLUMN "evidencePreferences"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."voice_status_enum" AS ENUM('calibrating', 'active')
        `);
        await queryRunner.query(`
            ALTER TABLE "voice"
            ADD "status" "public"."voice_status_enum" NOT NULL DEFAULT 'calibrating'
        `);
        await queryRunner.query(`
            ALTER TABLE "voice"
            ADD "data" jsonb NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "voice_calibration"
            ADD CONSTRAINT "FK_c75da2e7f6ca6d50d8d0bb32da9" FOREIGN KEY ("voice_id") REFERENCES "voice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "voice_calibration"
            ADD CONSTRAINT "FK_7b073d1ba40b0c974cce6385ec1" FOREIGN KEY ("note_id") REFERENCES "note"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "voice_calibration" DROP CONSTRAINT "FK_7b073d1ba40b0c974cce6385ec1"
        `);
        await queryRunner.query(`
            ALTER TABLE "voice_calibration" DROP CONSTRAINT "FK_c75da2e7f6ca6d50d8d0bb32da9"
        `);
        await queryRunner.query(`
            ALTER TABLE "voice" DROP COLUMN "data"
        `);
        await queryRunner.query(`
            ALTER TABLE "voice" DROP COLUMN "status"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."voice_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "voice"
            ADD "evidencePreferences" text
        `);
        await queryRunner.query(`
            ALTER TABLE "voice"
            ADD "platformOverrides" jsonb
        `);
        await queryRunner.query(`
            ALTER TABLE "voice"
            ADD "tov" jsonb
        `);
        await queryRunner.query(`
            ALTER TABLE "voice"
            ADD "avoidRules" jsonb
        `);
        await queryRunner.query(`
            ALTER TABLE "voice"
            ADD "rules" jsonb NOT NULL
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_7dfc9e57f952e18e05d64ab964"
        `);
        await queryRunner.query(`
            DROP TABLE "voice_calibration"
        `);
    }

}
