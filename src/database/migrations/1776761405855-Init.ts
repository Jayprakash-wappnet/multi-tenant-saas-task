import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1776761405855 implements MigrationInterface {
    name = 'Init1776761405855'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1509c0ea804268d873721dd043" ON "teams" ("name", "tenantId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_1509c0ea804268d873721dd043"`);
    }

}
