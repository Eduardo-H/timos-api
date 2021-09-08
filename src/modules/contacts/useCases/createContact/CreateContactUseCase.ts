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

  async execute({ name, user_id }: ICreateContactDTO): Promise<Contact> {
    const contactAlreadyExists = await this.contactsRepository.findByName(
      name,
      user_id
    );

    if (contactAlreadyExists) {
      throw new AppError('Contact already exists');
    }

    const contact = await this.contactsRepository.create({ name, user_id });

    return contact;
  }
}

export { CreateContactUseCase };
