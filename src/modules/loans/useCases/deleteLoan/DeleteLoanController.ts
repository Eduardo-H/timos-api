import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { DeleteLoanUseCase } from './DeleteLoanUseCase';

class DeleteLoanController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: user_id } = request.user;
    const { id } = request.body;

    const deleteLoanUseCase = container.resolve(DeleteLoanUseCase);

    await deleteLoanUseCase.execute({ id, user_id });

    return response.status(200).send();
  }
}

export { DeleteLoanController };
