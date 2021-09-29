import { ICreateContactDTO } from '@modules/contacts/dtos/ICreateContactDTO';
import { Contact } from '@modules/contacts/infra/typeorm/entities/Contact';
import { IContactsRepository } from '@modules/contacts/repositories/IContactsRepository';
import { inject, injectable } from 'tsyringe';

import { AppError } from '@shared/errors/AppError';

@injectable()
class CreateContactUseCase {
  constructor(
    @inject('ContactsRepository')
    private contactsRepository: IContactsRepository
  ) {}

  async execute({ user_id, contact_id }: ICreateContactDTO): Promise<Contact> {
    const contactAlreadyExists = await this.contactsRepository.findConnection(
      user_id,
      contact_id
    );

    if (contactAlreadyExists) {
      throw new AppError('This connection already exists');
    }

    // Creating the contact for the user that received the invite
    const contact = await this.contactsRepository.create({
      user_id,
      contact_id
    });

    // Creating the contact for the user that sent the invite
    await this.contactsRepository.create({
      contact_id: user_id,
      user_id: contact_id
    });

    return contact;
  }
}

export { CreateContactUseCase };
