import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1776843467786 implements MigrationInterface {
    name = 'Init1776843467786'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "team_members" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "teams" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "task_assignments" ADD "deletedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_assignments" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "teams" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deletedAt"`);
    }

}
