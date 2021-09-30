import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { AprovePaymentUseCase } from './AprovePaymentUseCase';

class AprovePaymentController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: user_id } = request.user;
    const { id } = request.params;

    const aprovePaymentUseCase = container.resolve(AprovePaymentUseCase);

    await aprovePaymentUseCase.execute(id, user_id);

    return response.status(201).send();
  }
}

export { AprovePaymentController };
