import { Contact } from '@modules/contacts/infra/typeorm/entities/Contact';
import { IContactsRepository } from '@modules/contacts/repositories/IContactsRepository';
import { inject, injectable } from 'tsyringe';

import { AppError } from '@shared/errors/AppError';

interface IPayload {
  id: string;
  name: string;
  user_id: string;
}

@injectable()
class UpdateContactUseCase {
  constructor(
    @inject('ContactsRepository')
    private contactsRepository: IContactsRepository
  ) {}

  async execute({ id, name, user_id }: IPayload): Promise<Contact> {
    const contact = await this.contactsRepository.findById(id);

    if (!contact) {
      throw new AppError('Contact not found');
    }

    const contactAlreadyExists = await this.contactsRepository.findByName(
      name,
      user_id
    );

    if (contactAlreadyExists) {
      throw new AppError('Contact already exists');
    }

    const updatedContact = await this.contactsRepository.update(id, name);

    return updatedContact;
  }
}

export { UpdateContactUseCase };
