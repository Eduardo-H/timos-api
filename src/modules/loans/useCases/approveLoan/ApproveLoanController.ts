import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { ApproveLoanUseCase } from './ApproveLoanUseCase';

class ApproveLoanController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: user_id } = request.user;
    const { id } = request.params;

    const approveLoanUseCase = container.resolve(ApproveLoanUseCase);

    await approveLoanUseCase.execute({ id, user_id });

    return response.status(201).send();
  }
}

export { ApproveLoanController };
