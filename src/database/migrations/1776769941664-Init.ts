import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1776769941664 implements MigrationInterface {
    name = 'Init1776769941664'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "task_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "tenantId" character varying NOT NULL, "taskId" uuid, "userId" uuid, CONSTRAINT "PK_b68f42cf36d807d8a19a96066d7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b3aadb53857878177ea06f2653" ON "task_assignments" ("taskId", "userId") `);
        await queryRunner.query(`ALTER TABLE "task_assignments" ADD CONSTRAINT "FK_a5f6f6ce5f13705ff2b24d5cc2c" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_assignments" ADD CONSTRAINT "FK_0d951e778ad1e09bab71187f46c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_assignments" DROP CONSTRAINT "FK_0d951e778ad1e09bab71187f46c"`);
        await queryRunner.query(`ALTER TABLE "task_assignments" DROP CONSTRAINT "FK_a5f6f6ce5f13705ff2b24d5cc2c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b3aadb53857878177ea06f2653"`);
        await queryRunner.query(`DROP TABLE "task_assignments"`);
    }

}
