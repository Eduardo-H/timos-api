import { CreateContactController } from '@modules/contacts/useCases/createContact/CreateContactController';
import { DeleteContactController } from '@modules/contacts/useCases/deleteContact/DeleteContactController';
import { UpdateContactController } from '@modules/contacts/useCases/updateContact/UpdateContactController';
import { Router } from 'express';

import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const contactsRoutes = Router();

const createContactController = new CreateContactController();
const updateContactController = new UpdateContactController();
const deleteContactController = new DeleteContactController();

contactsRoutes.post('/', ensureAuthenticated, createContactController.handle);
contactsRoutes.put('/', ensureAuthenticated, updateContactController.handle);
contactsRoutes.delete('/', ensureAuthenticated, deleteContactController.handle);

export { contactsRoutes };
