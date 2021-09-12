import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreatePaymentUseCase } from './CreatePaymentUseCase';

class CreatePaymentController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: user_id } = request.user;
    const { loan_id, value } = request.body;

    const createPaymentUseCase = container.resolve(CreatePaymentUseCase);

    const payment = await createPaymentUseCase.execute({
      user_id,
      loan_id,
      value
    });

    return response.status(201).json(payment);
  }
}

export { CreatePaymentController };
