import { ICreateContactRequestDTO } from '../dtos/ICreateContactRequestDTO';
import { ContactRequest } from '../infra/typeorm/entities/ContactRequest';

interface IContactsRequestsRepository {
  create({
    user_id,
    requester_id
  }: ICreateContactRequestDTO): Promise<ContactRequest>;
  findConnectionRequest(
    user_id: string,
    requester_id: string
  ): Promise<ContactRequest>;
}

export { IContactsRequestsRepository };
