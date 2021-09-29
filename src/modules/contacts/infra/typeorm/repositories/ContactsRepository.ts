import { ICreateContactDTO } from '@modules/contacts/dtos/ICreateContactDTO';
import { IContactsRepository } from '@modules/contacts/repositories/IContactsRepository';
import { getRepository, Repository } from 'typeorm';

import { Contact } from '../entities/Contact';

class ContactsRepository implements IContactsRepository {
  private repository: Repository<Contact>;

  constructor() {
    this.repository = getRepository(Contact);
  }

  async create({ user_id, contact_id }: ICreateContactDTO): Promise<Contact> {
    const contact = this.repository.create({ user_id, contact_id });

    await this.repository.save(contact);

    return contact;
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async findById(id: string): Promise<Contact> {
    const contact = await this.repository.findOne({ id });

    return contact;
  }

  async findConnection(user_id: string, contact_id: string): Promise<Contact> {
    const contact = await this.repository.findOne({
      where: { user_id, contact_id }
    });

    return contact;
  }

  async listContacts(
    user_id: string,
    page: number,
    limit: number
  ): Promise<Contact[]> {
    const start = (page - 1) * limit;

    const contacts = await this.repository.find({
      where: { user_id },
      skip: start,
      take: limit,
      order: { created_at: 'ASC' }
    });

    return contacts;
  }
}

export { ContactsRepository };
