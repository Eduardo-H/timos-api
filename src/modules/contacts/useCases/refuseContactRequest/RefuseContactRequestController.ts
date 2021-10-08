import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { RefuseContactRequestUseCase } from './RefuseContactRequestUseCase';

class RefuseContactRequestController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: user_id } = request.user;
    const { id } = request.params;

    const refuseContactRequest = container.resolve(RefuseContactRequestUseCase);

    await refuseContactRequest.execute({ id, user_id });

    return response.status(200).send();
  }
}

export { RefuseContactRequestController };
