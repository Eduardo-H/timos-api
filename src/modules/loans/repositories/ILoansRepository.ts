import { ICreateLoanDTO } from '../dtos/ICreateLoanDTO';
import { IUpdateLoanDTO } from '../dtos/IUpdateLoanDTO';
import { Loan } from '../infra/typeorm/entities/Loan';

interface ILoansRepository {
  create({
    user_id,
    contact_id,
    value,
    type,
    limit_date
  }: ICreateLoanDTO): Promise<Loan>;
  update({
    id,
    user_id,
    contact_id,
    value,
    type,
    limit_date,
    closed_at,
    status
  }: IUpdateLoanDTO): Promise<Loan>;
  findById(id: string): Promise<Loan>;
}

export { ILoansRepository };