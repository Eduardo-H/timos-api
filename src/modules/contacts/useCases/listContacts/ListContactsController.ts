import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { ListContactsUseCase } from './ListContactsUseCase';

class ListContactsController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: user_id } = request.user;
    const page = Number(request.query.page) || 1;
    const limit = Number(request.query.limit) || 10;

    const listContactsUseCase = container.resolve(ListContactsUseCase);

    const contacts = await listContactsUseCase.execute({
      user_id,
      page,
      limit
    });

    return response.status(200).json(contacts);
  }
}

export { ListContactsController };
