import { ICreateContactDTO } from '@modules/contacts/dtos/ICreateContactDTO';
import { IContactsRepository } from '@modules/contacts/repositories/IContactsRepository';
import { getRepository, Repository } from 'typeorm';

import { Contact } from '../entities/Contact';

class ContactsRepository implements IContactsRepository {
  private repository: Repository<Contact>;

  constructor() {
    this.repository = getRepository(Contact);
  }

  async create({ name, user_id }: ICreateContactDTO): Promise<Contact> {
    const contact = this.repository.create({ name, user_id });

    await this.repository.save(contact);

    return contact;
  }

  async update(id: string, name: string): Promise<Contact> {
    const contact = await this.repository.findOne({ id });

    contact.name = name;

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

  async findByName(name: string, user_id: string): Promise<Contact> {
    const contact = await this.repository.findOne({
      name,
      user_id
    });

    return contact;
  }
}

export { ContactsRepository };
