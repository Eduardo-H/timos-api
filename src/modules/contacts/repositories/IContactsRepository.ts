import { ICreateContactDTO } from '../dtos/ICreateContactDTO';
import { Contact } from '../infra/typeorm/entities/Contact';

interface IContactsRepository {
  create({ name, user_id }: ICreateContactDTO): Promise<Contact>;
  findByName(name: string, user_id: string): Promise<Contact>;
}

export { IContactsRepository };
