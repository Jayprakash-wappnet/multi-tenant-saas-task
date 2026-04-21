import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1776769332543 implements MigrationInterface {
    name = 'Init1776769332543'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tasks_status_enum" AS ENUM('TODO', 'IN_PROGRESS', 'DONE')`);
        await queryRunner.query(`CREATE TYPE "public"."tasks_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH')`);
        await queryRunner.query(`CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "title" character varying NOT NULL, "description" character varying, "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'TODO', "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'MEDIUM', "tenantId" character varying NOT NULL, "teamId" uuid, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fff681d315d607f9f03e0a434d" ON "tasks" ("tenantId") `);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_12c5f5304c7d7c4deb27046671d" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_12c5f5304c7d7c4deb27046671d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fff681d315d607f9f03e0a434d"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
    }

}
