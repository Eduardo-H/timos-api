import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { ListLoansUseCase } from './ListLoansUseCase';

class ListLoansController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: user_id } = request.user;

    const listLoansUseCase = container.resolve(ListLoansUseCase);

    const loans = await listLoansUseCase.execute(user_id);

    return response.status(200).json(loans);
  }
}

export { ListLoansController };
