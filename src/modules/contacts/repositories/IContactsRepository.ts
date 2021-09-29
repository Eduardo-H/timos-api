import { ICreateContactDTO } from '../dtos/ICreateContactDTO';
import { Contact } from '../infra/typeorm/entities/Contact';

interface IContactsRepository {
  create({ user_id, contact_id }: ICreateContactDTO): Promise<Contact>;
  deleteById(id: string): Promise<void>;
  findById(id: string): Promise<Contact>;
  findConnection(user_id: string, contact_id: string): Promise<Contact>;
  listContacts(
    user_id: string,
    page: number,
    limit: number
  ): Promise<Contact[]>;
}

export { IContactsRepository };
