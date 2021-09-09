import { ICreateContactDTO } from '../dtos/ICreateContactDTO';
import { Contact } from '../infra/typeorm/entities/Contact';

interface IContactsRepository {
  create({ name, user_id }: ICreateContactDTO): Promise<Contact>;
  update(id: string, name: string): Promise<Contact>;
  deleteById(id: string): Promise<void>;
  findById(id: string): Promise<Contact>;
  findByName(name: string, user_id: string): Promise<Contact>;
}

export { IContactsRepository };
