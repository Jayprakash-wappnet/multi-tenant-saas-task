import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1776680503261 implements MigrationInterface {
    name = 'Init1776680503261'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "name" character varying NOT NULL, "tenantId" character varying NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7346b08032078107fce81e014f" ON "users" ("email", "tenantId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_7346b08032078107fce81e014f"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
