import { ICreateContactDTO } from '@modules/contacts/dtos/ICreateContactDTO';
import { Contact } from '@modules/contacts/infra/typeorm/entities/Contact';

import { IContactsRepository } from '../IContactsRepository';

class ContactsRepositoryInMemory implements IContactsRepository {
  contacts: Contact[] = [];

  async create({ name, user_id }: ICreateContactDTO): Promise<Contact> {
    const contact = new Contact();

    Object.assign(contact, {
      name,
      user_id
    });

    this.contacts.push(contact);

    return contact;
  }

  async update(id: string, name: string): Promise<Contact> {
    const contact = this.contacts.find((contact) => contact.id === id);

    Object.assign(contact, {
      name
    });

    return contact;
  }

  async deleteById(id: string): Promise<void> {
    const index = this.contacts.findIndex((contact) => contact.id === id);

    this.contacts.splice(index, 1);
  }

  async findById(id: string): Promise<Contact> {
    const contact = this.contacts.find((contact) => contact.id === id);

    return contact;
  }

  async findByName(name: string, user_id: string): Promise<Contact> {
    const contact = this.contacts.find(
      (contact) => contact.name === name && contact.user_id === user_id
    );

    return contact;
  }
}

export { ContactsRepositoryInMemory };
