import { Contact } from '@modules/contacts/infra/typeorm/entities/Contact';
import { IContactsRepository } from '@modules/contacts/repositories/IContactsRepository';
import { IContactsRequestsRepository } from '@modules/contacts/repositories/IContactsRequestsRepository';
import { inject, injectable } from 'tsyringe';

import { AppError } from '@shared/errors/AppError';

interface IPayload {
  id: string;
  user_id: string;
}

@injectable()
class AcceptContactRequestUseCase {
  constructor(
    @inject('ContactsRequestsRepository')
    private contactsRequestsRepository: IContactsRequestsRepository,
    @inject('ContactsRepository')
    private contactsRepository: IContactsRepository
  ) {}

  async execute({ id, user_id }: IPayload): Promise<Contact> {
    const contactRequest = await this.contactsRequestsRepository.findById(id);

    if (!contactRequest) {
      throw new AppError('Contact request not found');
    }

    if (contactRequest.user_id !== user_id) {
      throw new AppError("This user can't accept this contact request", 401);
    }

    // Creating the contact for the user that received the invite
    const contact = await this.contactsRepository.create({
      user_id,
      contact_id: contactRequest.requester_id
    });

    // Creating the contact for the user that sent the invite
    await this.contactsRepository.create({
      contact_id: user_id,
      user_id: contactRequest.requester_id
    });

    await this.contactsRequestsRepository.deleteById(id);

    return contact;
  }
}

export { AcceptContactRequestUseCase };
