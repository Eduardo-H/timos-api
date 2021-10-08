import { ICreateContactRequestDTO } from '@modules/contacts/dtos/ICreateContactRequestDTO';
import { IContactsRequestsRepository } from '@modules/contacts/repositories/IContactsRequestsRepository';
import { getRepository, Repository } from 'typeorm';

import { ContactRequest } from '../entities/ContactRequest';

class ContactsRequestsRepository implements IContactsRequestsRepository {
  private repository: Repository<ContactRequest>;

  constructor() {
    this.repository = getRepository(ContactRequest);
  }

  async create({
    user_id,
    requester_id
  }: ICreateContactRequestDTO): Promise<ContactRequest> {
    const contactRequest = this.repository.create({ user_id, requester_id });

    await this.repository.save(contactRequest);

    return contactRequest;
  }

  async findConnectionRequest(
    user_id: string,
    requester_id: string
  ): Promise<ContactRequest> {
    const contactRequest = await this.repository.findOne({
      where: { user_id, requester_id }
    });

    return contactRequest;
  }

  async findById(id: string): Promise<ContactRequest> {
    const request = await this.repository.findOne({ id });
    return request;
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}

export { ContactsRequestsRepository };
