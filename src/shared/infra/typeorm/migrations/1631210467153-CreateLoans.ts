import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateLoans1631210467153 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'loans',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true
          },
          {
            name: 'receiver_id',
            type: 'uuid'
          },
          {
            name: 'payer_id',
            type: 'uuid'
          },
          {
            name: 'value',
            type: 'numeric'
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['pagar', 'receber']
          },
          {
            name: 'fee',
            type: 'numeric',
            isNullable: true
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['aberto', 'recusado', 'finalizado']
          },
          {
            name: 'limit_date',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'closed_at',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()'
          }
        ],
        foreignKeys: [
          {
            name: 'FKReceiverLoan',
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            columnNames: ['receiver_id'],
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          {
            name: 'FKPayerLoan',
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            columnNames: ['payer_id'],
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          }
        ]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('loans');
  }
}
