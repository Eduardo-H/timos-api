import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { AcceptContactRequestUseCase } from './AcceptContactRequestUseCase';

class AcceptContactRequestController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: user_id } = request.user;
    const { id } = request.params;

    const acceptContactRequestUseCase = container.resolve(
      AcceptContactRequestUseCase
    );

    await acceptContactRequestUseCase.execute({
      id,
      user_id
    });

    return response.status(201).send();
  }
}

export { AcceptContactRequestController };
