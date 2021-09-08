import { Router } from 'express';

import { authenticateRoutes } from './authenticate.routes';
import { contactsRoutes } from './contacts.routes';
import { usersRoutes } from './users.routes';

const router = Router();

router.use('/users', usersRoutes);
router.use('/contacts', contactsRoutes);
router.use(authenticateRoutes);

export { router };
