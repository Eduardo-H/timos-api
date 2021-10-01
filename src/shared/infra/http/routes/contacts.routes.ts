import { CreateContactController } from '@modules/contacts/useCases/createContact/CreateContactController';
import { CreateContactRequestController } from '@modules/contacts/useCases/createContactRequest/CreateContactRequestController';
import { DeleteContactController } from '@modules/contacts/useCases/deleteContact/DeleteContactController';
import { ListContactsController } from '@modules/contacts/useCases/listContacts/ListContactsController';
import { Router } from 'express';

import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const contactsRoutes = Router();

const createContactController = new CreateContactController();
const deleteContactController = new DeleteContactController();
const listContactsController = new ListContactsController();
const createContactRequestController = new CreateContactRequestController();

contactsRoutes.post('/', ensureAuthenticated, createContactController.handle);
contactsRoutes.delete('/', ensureAuthenticated, deleteContactController.handle);
contactsRoutes.get('/', ensureAuthenticated, listContactsController.handle);
contactsRoutes.post(
  '/request',
  ensureAuthenticated,
  createContactRequestController.handle
);

export { contactsRoutes };
