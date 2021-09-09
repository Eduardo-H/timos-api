import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { UpdateContactUseCase } from './UpdateContactUseCase';

class UpdateContactController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id, name } = request.body;
    const { id: user_id } = request.user;

    const updateContactUseCase = container.resolve(UpdateContactUseCase);

    await updateContactUseCase.execute({ id, name, user_id });

    return response.status(201).send();
  }
}

export { UpdateContactController };
