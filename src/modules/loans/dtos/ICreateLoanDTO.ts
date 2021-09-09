import { LoanType } from '../infra/typeorm/entities/Loan';

interface ICreateLoanDTO {
  user_id: string;
  contact_id: string;
  value: number;
  type: LoanType;
  limit_date?: Date;
}

export { ICreateLoanDTO };
