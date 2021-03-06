import { Router } from 'express';

import { authenticateRoutes } from './authenticate.routes';
import { contactsRoutes } from './contacts.routes';
import { loansRoutes } from './loans.routes';
import { profileRoutes } from './profile.routes';
import { usersRoutes } from './users.routes';

const router = Router();

router.use('/users', usersRoutes);
router.use('/contacts', contactsRoutes);
router.use('/loans', loansRoutes);
router.use(authenticateRoutes);
router.use(profileRoutes);

export { router };
