import { MigrationInterface, QueryRunner } from "typeorm";

export class IdeaSaved1777604429506 implements MigrationInterface {
    name = 'IdeaSaved1777604429506'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "idea"
            ADD "is_saved" boolean NOT NULL DEFAULT false
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "idea" DROP COLUMN "is_saved"
        `);
    }

}
