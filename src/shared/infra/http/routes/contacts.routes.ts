import { CreateContactController } from '@modules/contacts/useCases/createContact/CreateContactController';
import { Router } from 'express';

import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const contactsRoutes = Router();

const createContactController = new CreateContactController();

contactsRoutes.post('/', ensureAuthenticated, createContactController.handle);

export { contactsRoutes };
