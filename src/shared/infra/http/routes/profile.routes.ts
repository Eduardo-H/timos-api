import { UserProfileController } from '@modules/accounts/useCases/userProfile/UserProfileController';
import { Router } from 'express';

import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const profileRoutes = Router();

const userProfileController = new UserProfileController();

profileRoutes.get('/me', ensureAuthenticated, userProfileController.handle);

export { profileRoutes };
