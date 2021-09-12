import { ICreatePaymentDTO } from '../dtos/ICreatePaymentDTO';
import { Payment } from '../infra/typeorm/entities/Payment';

interface IPaymentsRepository {
  create({ loan_id, value }: ICreatePaymentDTO): Promise<Payment>;
  listByLoanId(loan_id: string): Promise<Payment[]>;
}

export { IPaymentsRepository };
