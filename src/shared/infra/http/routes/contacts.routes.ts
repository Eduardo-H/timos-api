import { CreateContactController } from '@modules/contacts/useCases/createContact/CreateContactController';
import { CreateContactRequestController } from '@modules/contacts/useCases/createContactRequest/CreateContactRequestController';
import { DeleteContactController } from '@modules/contacts/useCases/deleteContact/DeleteContactController';
import { ListContactsController } from '@modules/contacts/useCases/listContacts/ListContactsController';
import { RefuseContactRequestController } from '@modules/contacts/useCases/refuseContactRequest/RefuseContactRequestController';
import { Router } from 'express';

import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const contactsRoutes = Router();

const createContactController = new CreateContactController();
const deleteContactController = new DeleteContactController();
const listContactsController = new ListContactsController();
const createContactRequestController = new CreateContactRequestController();
const refuseContactRequestController = new RefuseContactRequestController();

contactsRoutes.post('/', ensureAuthenticated, createContactController.handle);
contactsRoutes.delete('/', ensureAuthenticated, deleteContactController.handle);
contactsRoutes.get('/', ensureAuthenticated, listContactsController.handle);
contactsRoutes.post(
  '/requests',
  ensureAuthenticated,
  createContactRequestController.handle
);
contactsRoutes.delete(
  '/requests/:id/refuse',
  ensureAuthenticated,
  refuseContactRequestController.handle
);

export { contactsRoutes };
