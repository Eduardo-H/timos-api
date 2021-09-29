import { ICreatePaymentDTO } from '@modules/loans/dtos/ICreatePaymentDTO';
import { Payment } from '@modules/loans/infra/typeorm/entities/Payment';

import { IPaymentsRepository } from '../IPaymentsRepository';

class PaymentsRepositoryInMemory implements IPaymentsRepository {
  payments: Payment[] = [];

  async create({ loan_id, value }: ICreatePaymentDTO): Promise<Payment> {
    const payment = new Payment();

    Object.assign(payment, {
      loan_id,
      value,
      status: 'pendente'
    });

    this.payments.push(payment);

    return payment;
  }

  async listByLoanId(loan_id: string): Promise<Payment[]> {
    const payments = this.payments.filter(
      (payment) => payment.loan_id === loan_id
    );

    return payments;
  }
}

export { PaymentsRepositoryInMemory };
