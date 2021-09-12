import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateLoanUseCase } from './CreateLoanUseCase';

class CreateLoanController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: user_id } = request.user;
    const { contact_id, value, type, fee, limit_date } = request.body;

    const createLoanUseCase = container.resolve(CreateLoanUseCase);

    const loan = await createLoanUseCase.execute({
      user_id,
      contact_id,
      value,
      type,
      fee,
      limit_date
    });

    return response.status(201).json(loan);
  }
}

export { CreateLoanController };
