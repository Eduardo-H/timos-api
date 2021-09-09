import { CreateUserController } from '@modules/accounts/useCases/createUser/CreateUserController';
import { DeleteUserController } from '@modules/accounts/useCases/deleteUser/DeleteUserController';
import { Router } from 'express';

import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const usersRoutes = Router();

const createUserController = new CreateUserController();
const deleteUserController = new DeleteUserController();

usersRoutes.post('/', createUserController.handle);
usersRoutes.delete('/', ensureAuthenticated, deleteUserController.handle);

export { usersRoutes };
