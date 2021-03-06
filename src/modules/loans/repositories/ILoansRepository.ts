import { ICreateLoanDTO } from '../dtos/ICreateLoanDTO';
import { IUpdateLoanDTO } from '../dtos/IUpdateLoanDTO';
import { Loan } from '../infra/typeorm/entities/Loan';

interface ILoansRepository {
  create({
    payer_id,
    receiver_id,
    value,
    type,
    fee,
    limit_date,
    creator_id
  }: ICreateLoanDTO): Promise<Loan>;
  update({
    id,
    payer_id,
    receiver_id,
    value,
    type,
    limit_date,
    closed_at,
    status
  }: IUpdateLoanDTO): Promise<Loan>;
  deleteById(id: string): Promise<void>;
  listByUserId(user_id: string): Promise<Loan[]>;
  findById(id: string): Promise<Loan>;
  changeStatusById(id: string, status: string): Promise<void>;
}

export { ILoansRepository };
