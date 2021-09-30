import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { ApprovePaymentUseCase } from './ApprovePaymentUseCase';

class ApprovePaymentController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: user_id } = request.user;
    const { id } = request.params;

    const approvePaymentUseCase = container.resolve(ApprovePaymentUseCase);

    await approvePaymentUseCase.execute(id, user_id);

    return response.status(201).send();
  }
}

export { ApprovePaymentController };
