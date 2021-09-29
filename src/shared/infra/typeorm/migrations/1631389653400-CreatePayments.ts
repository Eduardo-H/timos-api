import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePayments1631389653400 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true
          },
          {
            name: 'loan_id',
            type: 'uuid'
          },
          {
            name: 'value',
            type: 'numeric'
          },
          {
            name: 'status',
            type: 'varchar'
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()'
          }
        ],
        foreignKeys: [
          {
            name: 'FKLoanPayment',
            referencedTableName: 'loans',
            referencedColumnNames: ['id'],
            columnNames: ['loan_id'],
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payments');
  }
}
