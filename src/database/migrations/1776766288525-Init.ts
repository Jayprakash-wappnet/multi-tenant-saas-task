import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1776766288525 implements MigrationInterface {
    name = 'Init1776766288525'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b2f17b533905e0a94390c5e220" ON "team_members" ("teamId", "userId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_b2f17b533905e0a94390c5e220"`);
    }

}
