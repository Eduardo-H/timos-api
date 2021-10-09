import { AcceptContactRequestController } from '@modules/contacts/useCases/acceptContactRequest/AcceptContactRequestController';
import { CreateContactRequestController } from '@modules/contacts/useCases/createContactRequest/CreateContactRequestController';
import { DeleteContactController } from '@modules/contacts/useCases/deleteContact/DeleteContactController';
import { ListContactsController } from '@modules/contacts/useCases/listContacts/ListContactsController';
import { RefuseContactRequestController } from '@modules/contacts/useCases/refuseContactRequest/RefuseContactRequestController';
import { Router } from 'express';

import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const contactsRoutes = Router();

const acceptContactRequestController = new AcceptContactRequestController();
const deleteContactController = new DeleteContactController();
const listContactsController = new ListContactsController();
const createContactRequestController = new CreateContactRequestController();
const refuseContactRequestController = new RefuseContactRequestController();

contactsRoutes.post(
  '/requests',
  ensureAuthenticated,
  createContactRequestController.handle
);
contactsRoutes.post(
  '/requests/:id/accept',
  ensureAuthenticated,
  acceptContactRequestController.handle
);
contactsRoutes.delete(
  '/requests/:id/refuse',
  ensureAuthenticated,
  refuseContactRequestController.handle
);
contactsRoutes.delete('/', ensureAuthenticated, deleteContactController.handle);
contactsRoutes.get('/', ensureAuthenticated, listContactsController.handle);

export { contactsRoutes };
