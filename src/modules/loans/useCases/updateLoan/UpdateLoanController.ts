import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { UpdateLoanUseCase } from './UpdateLoanUseCase';

class UpdateLoanController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: user_id } = request.user;
    const { id, value, type, limit_date, closed_at, status } = request.body;

    const updateLoanUseCase = container.resolve(UpdateLoanUseCase);

    const loan = await updateLoanUseCase.execute({
      id,
      user_id,
      value,
      type,
      limit_date,
      closed_at,
      status
    });

    return response.status(201).json(loan);
  }
}

export { UpdateLoanController };
