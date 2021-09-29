import { UpdateUserController } from '@modules/accounts/useCases/updateUser/UpdateUserController';
import { UserProfileController } from '@modules/accounts/useCases/userProfile/UserProfileController';
import { Router } from 'express';

import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const profileRoutes = Router();

const userProfileController = new UserProfileController();
const updateUserController = new UpdateUserController();

profileRoutes.get('/me', ensureAuthenticated, userProfileController.handle);
profileRoutes.put('/me', ensureAuthenticated, updateUserController.handle);

export { profileRoutes };
