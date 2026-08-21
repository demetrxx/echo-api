import { MigrationInterface, QueryRunner } from 'typeorm';

export class QaFoundation1777650000000 implements MigrationInterface {
  name = 'QaFoundation1777650000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD "is_qa_sandbox" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."qa_profile_segment_enum" AS ENUM(
        'founder_operator',
        'expert_educator',
        'reflective_writer',
        'custom',
        'clone'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."qa_profile_source_enum" AS ENUM(
        'ai_generated',
        'fixture_import',
        'real_clone'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."qa_profile_status_enum" AS ENUM(
        'draft',
        'materializing',
        'ready',
        'out_of_date',
        'failed',
        'archived'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."qa_system_version_role_enum" AS ENUM(
        'baseline',
        'candidate',
        'archived'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."qa_case_kind_enum" AS ENUM('atomic', 'guided')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."qa_case_status_enum" AS ENUM('active', 'archived')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."qa_suite_status_enum" AS ENUM('active', 'archived')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."qa_run_kind_enum" AS ENUM('atomic', 'guided')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."qa_run_status_enum" AS ENUM(
        'draft',
        'ready',
        'running',
        'paused',
        'completed',
        'failed',
        'cancelled'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."qa_context_policy_enum" AS ENUM(
        'exact',
        'product_defaults'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."qa_reviewer_type_enum" AS ENUM('ai', 'human')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."qa_issue_severity_enum" AS ENUM(
        'minor',
        'major',
        'critical'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."qa_issue_status_enum" AS ENUM(
        'open',
        'fixed',
        'ignored'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "qa_system_version" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "label" character varying(255) NOT NULL,
        "description" text,
        "role" "public"."qa_system_version_role_enum" NOT NULL DEFAULT 'candidate',
        "codeRevision" character varying(255),
        "isDirty" boolean NOT NULL DEFAULT false,
        "models" jsonb NOT NULL DEFAULT '{}',
        "prompts" jsonb NOT NULL DEFAULT '{}',
        "runtime" jsonb NOT NULL DEFAULT '{}',
        CONSTRAINT "PK_qa_system_version" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_qa_system_version_createdAt" ON "qa_system_version" ("createdAt")`,
    );

    await queryRunner.query(`
      CREATE TABLE "qa_profile" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "name" character varying(255) NOT NULL,
        "segment" "public"."qa_profile_segment_enum" NOT NULL,
        "source" "public"."qa_profile_source_enum" NOT NULL,
        "fixtureKey" character varying(255),
        "definition" jsonb NOT NULL DEFAULT '{}',
        "draftRevision" integer NOT NULL DEFAULT 0,
        "status" "public"."qa_profile_status_enum" NOT NULL DEFAULT 'draft',
        "materializationError" text,
        "materializedAt" TIMESTAMP,
        "sandbox_user_id" uuid,
        "source_user_id" uuid,
        CONSTRAINT "PK_qa_profile" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_qa_profile_createdAt" ON "qa_profile" ("createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_qa_profile_sandbox_user" ON "qa_profile" ("sandbox_user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_qa_profile_source_user" ON "qa_profile" ("source_user_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "qa_profile"
      ADD CONSTRAINT "FK_qa_profile_sandbox_user"
      FOREIGN KEY ("sandbox_user_id") REFERENCES "user"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "qa_profile"
      ADD CONSTRAINT "FK_qa_profile_source_user"
      FOREIGN KEY ("source_user_id") REFERENCES "user"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE TABLE "qa_suite" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "name" character varying(255) NOT NULL,
        "description" text,
        "segment" "public"."qa_profile_segment_enum" NOT NULL,
        "caseIds" jsonb NOT NULL DEFAULT '[]',
        "defaultRubrics" jsonb NOT NULL DEFAULT '{}',
        "status" "public"."qa_suite_status_enum" NOT NULL DEFAULT 'active',
        "baseline_system_version_id" uuid,
        CONSTRAINT "PK_qa_suite" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_qa_suite_createdAt" ON "qa_suite" ("createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_qa_suite_baseline_version" ON "qa_suite" ("baseline_system_version_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "qa_suite"
      ADD CONSTRAINT "FK_qa_suite_baseline_version"
      FOREIGN KEY ("baseline_system_version_id") REFERENCES "qa_system_version"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE TABLE "qa_case" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "name" character varying(255) NOT NULL,
        "segment" "public"."qa_profile_segment_enum" NOT NULL,
        "kind" "public"."qa_case_kind_enum" NOT NULL,
        "definition" jsonb NOT NULL DEFAULT '{}',
        "rubric" jsonb NOT NULL DEFAULT '[]',
        "status" "public"."qa_case_status_enum" NOT NULL DEFAULT 'active',
        "profile_id" uuid,
        "created_from_run_id" uuid,
        CONSTRAINT "PK_qa_case" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_qa_case_createdAt" ON "qa_case" ("createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_qa_case_profile" ON "qa_case" ("profile_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "qa_case"
      ADD CONSTRAINT "FK_qa_case_profile"
      FOREIGN KEY ("profile_id") REFERENCES "qa_profile"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE TABLE "qa_run" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "kind" "public"."qa_run_kind_enum" NOT NULL,
        "status" "public"."qa_run_status_enum" NOT NULL DEFAULT 'draft',
        "currentStepKey" character varying(255),
        "contextPolicy" "public"."qa_context_policy_enum" NOT NULL DEFAULT 'product_defaults',
        "profileSnapshot" jsonb NOT NULL DEFAULT '{}',
        "systemVersionSnapshot" jsonb NOT NULL DEFAULT '{}',
        "rubricSnapshot" jsonb NOT NULL DEFAULT '[]',
        "resolvedContext" jsonb NOT NULL DEFAULT '{}',
        "steps" jsonb NOT NULL DEFAULT '[]',
        "summary" jsonb,
        "startedAt" TIMESTAMP,
        "completedAt" TIMESTAMP,
        "profile_id" uuid,
        "case_id" uuid,
        "suite_id" uuid,
        "system_version_id" uuid,
        "operator_user_id" uuid,
        CONSTRAINT "PK_qa_run" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_qa_run_createdAt" ON "qa_run" ("createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_qa_run_status" ON "qa_run" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_qa_run_profile" ON "qa_run" ("profile_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_qa_run_case" ON "qa_run" ("case_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_qa_run_system_version" ON "qa_run" ("system_version_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "qa_run"
      ADD CONSTRAINT "FK_qa_run_profile"
      FOREIGN KEY ("profile_id") REFERENCES "qa_profile"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "qa_run"
      ADD CONSTRAINT "FK_qa_run_case"
      FOREIGN KEY ("case_id") REFERENCES "qa_case"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "qa_run"
      ADD CONSTRAINT "FK_qa_run_suite"
      FOREIGN KEY ("suite_id") REFERENCES "qa_suite"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "qa_run"
      ADD CONSTRAINT "FK_qa_run_system_version"
      FOREIGN KEY ("system_version_id") REFERENCES "qa_system_version"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "qa_run"
      ADD CONSTRAINT "FK_qa_run_operator_user"
      FOREIGN KEY ("operator_user_id") REFERENCES "user"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE TABLE "qa_review" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "reviewerType" "public"."qa_reviewer_type_enum" NOT NULL,
        "stepKey" character varying(255),
        "overall_score" integer NOT NULL,
        "criteria" jsonb NOT NULL DEFAULT '[]',
        "comment" text,
        "run_id" uuid NOT NULL,
        "reviewer_user_id" uuid,
        CONSTRAINT "PK_qa_review" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_qa_review_overall_score" CHECK (
          "overall_score" >= 1 AND "overall_score" <= 10
        )
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_qa_review_createdAt" ON "qa_review" ("createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_qa_review_run" ON "qa_review" ("run_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "qa_review"
      ADD CONSTRAINT "FK_qa_review_run"
      FOREIGN KEY ("run_id") REFERENCES "qa_run"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "qa_review"
      ADD CONSTRAINT "FK_qa_review_reviewer_user"
      FOREIGN KEY ("reviewer_user_id") REFERENCES "user"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE TABLE "qa_issue" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "title" character varying(255) NOT NULL,
        "description" text,
        "capabilityKey" character varying(255) NOT NULL,
        "stepKey" character varying(255),
        "severity" "public"."qa_issue_severity_enum" NOT NULL DEFAULT 'major',
        "status" "public"."qa_issue_status_enum" NOT NULL DEFAULT 'open',
        "run_id" uuid,
        "resolution_run_id" uuid,
        "created_by_user_id" uuid,
        CONSTRAINT "PK_qa_issue" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_qa_issue_createdAt" ON "qa_issue" ("createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_qa_issue_status" ON "qa_issue" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_qa_issue_run" ON "qa_issue" ("run_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "qa_issue"
      ADD CONSTRAINT "FK_qa_issue_run"
      FOREIGN KEY ("run_id") REFERENCES "qa_run"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "qa_issue"
      ADD CONSTRAINT "FK_qa_issue_resolution_run"
      FOREIGN KEY ("resolution_run_id") REFERENCES "qa_run"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "qa_issue"
      ADD CONSTRAINT "FK_qa_issue_created_by_user"
      FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qa_issue" DROP CONSTRAINT "FK_qa_issue_created_by_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qa_issue" DROP CONSTRAINT "FK_qa_issue_resolution_run"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qa_issue" DROP CONSTRAINT "FK_qa_issue_run"`,
    );
    await queryRunner.query(`DROP TABLE "qa_issue"`);

    await queryRunner.query(
      `ALTER TABLE "qa_review" DROP CONSTRAINT "FK_qa_review_reviewer_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qa_review" DROP CONSTRAINT "FK_qa_review_run"`,
    );
    await queryRunner.query(`DROP TABLE "qa_review"`);

    await queryRunner.query(
      `ALTER TABLE "qa_run" DROP CONSTRAINT "FK_qa_run_operator_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qa_run" DROP CONSTRAINT "FK_qa_run_system_version"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qa_run" DROP CONSTRAINT "FK_qa_run_suite"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qa_run" DROP CONSTRAINT "FK_qa_run_case"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qa_run" DROP CONSTRAINT "FK_qa_run_profile"`,
    );
    await queryRunner.query(`DROP TABLE "qa_run"`);

    await queryRunner.query(
      `ALTER TABLE "qa_case" DROP CONSTRAINT "FK_qa_case_profile"`,
    );
    await queryRunner.query(`DROP TABLE "qa_case"`);

    await queryRunner.query(
      `ALTER TABLE "qa_suite" DROP CONSTRAINT "FK_qa_suite_baseline_version"`,
    );
    await queryRunner.query(`DROP TABLE "qa_suite"`);

    await queryRunner.query(
      `ALTER TABLE "qa_profile" DROP CONSTRAINT "FK_qa_profile_source_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qa_profile" DROP CONSTRAINT "FK_qa_profile_sandbox_user"`,
    );
    await queryRunner.query(`DROP TABLE "qa_profile"`);
    await queryRunner.query(`DROP TABLE "qa_system_version"`);

    await queryRunner.query(`DROP TYPE "public"."qa_issue_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."qa_issue_severity_enum"`);
    await queryRunner.query(`DROP TYPE "public"."qa_reviewer_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."qa_context_policy_enum"`);
    await queryRunner.query(`DROP TYPE "public"."qa_run_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."qa_run_kind_enum"`);
    await queryRunner.query(`DROP TYPE "public"."qa_suite_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."qa_case_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."qa_case_kind_enum"`);
    await queryRunner.query(`DROP TYPE "public"."qa_system_version_role_enum"`);
    await queryRunner.query(`DROP TYPE "public"."qa_profile_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."qa_profile_source_enum"`);
    await queryRunner.query(`DROP TYPE "public"."qa_profile_segment_enum"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "is_qa_sandbox"`,
    );
  }
}
