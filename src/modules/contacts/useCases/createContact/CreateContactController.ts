import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateContactUseCase } from './CreateContactUseCase';

class CreateContactController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { name } = request.body;
    const { id } = request.user;

    const createContactUseCase = container.resolve(CreateContactUseCase);

    const contact = await createContactUseCase.execute({
      name,
      user_id: id
    });

    return response.status(201).json(contact);
  }
}

export { CreateContactController };
