import { ICreateLoanDTO } from '../dtos/ICreateLoanDTO';
import { Loan } from '../infra/typeorm/entities/Loan';

interface ILoansRepository {
  create({
    user_id,
    contact_id,
    value,
    type,
    limit_date
  }: ICreateLoanDTO): Promise<Loan>;
}

export { ILoansRepository };
