import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1760000000000 implements MigrationInterface {
  name = 'CreateUsers1760000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar(320) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "is_email_verified" boolean NOT NULL DEFAULT false,
        "role" varchar(16) NOT NULL DEFAULT 'user',
        "token_version" integer NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "CHK_users_role" CHECK ("role" IN ('user', 'admin'))
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "users"');
  }
}
