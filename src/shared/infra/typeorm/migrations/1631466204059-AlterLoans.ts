import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterLoans1631466204059 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'loans',
      new TableColumn({
        name: 'fee',
        type: 'numeric',
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('loans', 'fee');
  }
}
