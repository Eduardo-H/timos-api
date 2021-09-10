import { LoanType, Status } from '../infra/typeorm/entities/Loan';

interface IUpdateLoanDTO {
  id: string;
  user_id: string;
  contact_id: string;
  value: number;
  type: LoanType;
  limit_date?: Date;
  closed_at?: Date;
  status: Status;
}

export { IUpdateLoanDTO };
