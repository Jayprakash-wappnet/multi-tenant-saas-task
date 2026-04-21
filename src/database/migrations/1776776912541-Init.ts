import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1776776912541 implements MigrationInterface {
    name = 'Init1776776912541'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "resetToken" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "resetTokenExpiry" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetTokenExpiry"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetToken"`);
    }

}
