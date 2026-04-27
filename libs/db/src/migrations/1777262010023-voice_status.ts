import { MigrationInterface, QueryRunner } from 'typeorm';

export class VoiceStatus1777262010023 implements MigrationInterface {
  name = 'VoiceStatus1777262010023';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "voice_example" DROP COLUMN "platform"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "voice_example"
            ADD "platform" "public"."platform_type_enum" NOT NULL
        `);
  }
}
