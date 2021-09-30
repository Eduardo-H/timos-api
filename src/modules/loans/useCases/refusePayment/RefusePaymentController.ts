import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { RefusePaymentUseCase } from './RefusePaymentUseCase';

class RefusePaymentController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: user_id } = request.user;
    const { id } = request.params;

    const refusePaymentUseCase = container.resolve(RefusePaymentUseCase);

    await refusePaymentUseCase.execute(id, user_id);

    return response.status(201).send();
  }
}

export { RefusePaymentController };
