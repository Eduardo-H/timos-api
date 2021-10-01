import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateContactRequestUseCase } from './CreateContactRequestUseCase';

class CreateContactRequestController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: requester_id } = request.user;
    const { user_id } = request.body;

    const createContactRequestUseCase = container.resolve(
      CreateContactRequestUseCase
    );

    const contactRequest = await createContactRequestUseCase.execute({
      user_id,
      requester_id
    });

    return response.status(201).json(contactRequest);
  }
}

export { CreateContactRequestController };
