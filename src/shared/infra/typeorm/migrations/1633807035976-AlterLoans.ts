import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey
} from 'typeorm';

export class AlterLoans1633807035976 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'loans',
      'status',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: ['pendente', 'aberto', 'recusado', 'finalizado']
      })
    );

    await queryRunner.addColumn(
      'loans',
      new TableColumn({
        name: 'creator_id',
        type: 'uuid'
      })
    );

    await queryRunner.createForeignKey(
      'loans',
      new TableForeignKey({
        name: 'FKCreatorLoan',
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        columnNames: ['creator_id'],
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('loans', 'FKCreatorLoan');
    await queryRunner.dropColumn('loans', 'creator_id');

    await queryRunner.changeColumn(
      'loans',
      'status',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: ['aberto', 'recusado', 'finalizado']
      })
    );
  }
}
