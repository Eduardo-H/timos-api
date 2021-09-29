import { IContactsRepository } from '@modules/contacts/repositories/IContactsRepository';
import { inject, injectable } from 'tsyringe';

import { AppError } from '@shared/errors/AppError';

interface IPayload {
  user_id: string;
  contact_id: string;
}

@injectable()
class DeleteContactUseCase {
  constructor(
    @inject('ContactsRepository')
    private contactsRepository: IContactsRepository
  ) {}

  async execute({ user_id, contact_id }: IPayload): Promise<void> {
    const contact = await this.contactsRepository.findConnection(
      user_id,
      contact_id
    );

    if (!contact) {
      throw new AppError("You're not connected to this user");
    }

    // Removing the contact for the user that requested the deletion
    await this.contactsRepository.deleteById(contact.id);

    // Removing the contact for the other user
    const otherContact = await this.contactsRepository.findConnection(
      contact_id,
      user_id
    );

    if (otherContact) {
      await this.contactsRepository.deleteById(otherContact.id);
    }
  }
}

export { DeleteContactUseCase };
