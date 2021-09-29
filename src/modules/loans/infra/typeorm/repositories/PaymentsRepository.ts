import { ICreatePaymentDTO } from '@modules/loans/dtos/ICreatePaymentDTO';
import { IPaymentsRepository } from '@modules/loans/repositories/IPaymentsRepository';
import { getRepository, Repository } from 'typeorm';

import { Payment } from '../entities/Payment';

class PaymentsRepository implements IPaymentsRepository {
  private repository: Repository<Payment>;

  constructor() {
    this.repository = getRepository(Payment);
  }

  async create({ loan_id, value }: ICreatePaymentDTO): Promise<Payment> {
    const payment = this.repository.create({
      loan_id,
      value,
      status: 'pendente'
    });

    await this.repository.save(payment);

    return payment;
  }

  async listByLoanId(loan_id: string): Promise<Payment[]> {
    const payments = await this.repository.find({ loan_id });
    return payments;
  }
}

export { PaymentsRepository };
