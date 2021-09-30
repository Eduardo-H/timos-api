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

  async findById(id: string): Promise<Payment> {
    const payement = this.payments.find((payment) => payment.id === id);
    return payement;
  }

  async updateStatusById(id: string, status: string): Promise<void> {
    const payment = this.payments.find((payment) => payment.id === id);

    Object.assign(payment, {
      status
    });
  }
}

export { PaymentsRepositoryInMemory };
