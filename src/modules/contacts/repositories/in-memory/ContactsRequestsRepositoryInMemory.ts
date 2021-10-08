import { ICreateContactRequestDTO } from '@modules/contacts/dtos/ICreateContactRequestDTO';
import { ContactRequest } from '@modules/contacts/infra/typeorm/entities/ContactRequest';

import { IContactsRequestsRepository } from '../IContactsRequestsRepository';

class ContactsRequestsRepositoryInMemory
  implements IContactsRequestsRepository
{
  contactsRequest: ContactRequest[] = [];

  async create({
    user_id,
    requester_id
  }: ICreateContactRequestDTO): Promise<ContactRequest> {
    const contactRequest = new ContactRequest();

    Object.assign(contactRequest, {
      user_id,
      requester_id
    });

    this.contactsRequest.push(contactRequest);

    return contactRequest;
  }

  async findConnectionRequest(
    user_id: string,
    requester_id: string
  ): Promise<ContactRequest> {
    const contactRequest = this.contactsRequest.find(
      (request) =>
        request.user_id === user_id && request.requester_id === requester_id
    );

    return contactRequest;
  }

  async findById(id: string): Promise<ContactRequest> {
    const request = this.contactsRequest.find((request) => request.id === id);
    return request;
  }

  async deleteById(id: string): Promise<void> {
    const index = this.contactsRequest.findIndex(
      (request) => request.id === id
    );

    this.contactsRequest.splice(index, 1);
  }
}

export { ContactsRequestsRepositoryInMemory };
