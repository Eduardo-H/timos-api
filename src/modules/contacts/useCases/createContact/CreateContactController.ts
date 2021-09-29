import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateContactUseCase } from './CreateContactUseCase';

class CreateContactController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { contact_id } = request.body;
    const { id: user_id } = request.user;

    const createContactUseCase = container.resolve(CreateContactUseCase);

    await createContactUseCase.execute({
      user_id,
      contact_id
    });

    return response.status(201).send();
  }
}

export { CreateContactController };
