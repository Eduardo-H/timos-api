import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { RefuseLoanUseCase } from './RefuseLoanUseCase';

class RefuseLoanController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: user_id } = request.user;
    const { id } = request.params;

    const refuseLoanUseCase = container.resolve(RefuseLoanUseCase);

    await refuseLoanUseCase.execute({ id, user_id });

    return response.status(200).send();
  }
}

export { RefuseLoanController };
