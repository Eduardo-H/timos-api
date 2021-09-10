import { CreateLoanController } from '@modules/loans/useCases/createLoan/CreateLoanController';
import { UpdateLoanController } from '@modules/loans/useCases/updateLoan/UpdateLoanController';
import { Router } from 'express';

import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const loansRoutes = Router();

const createLoanController = new CreateLoanController();
const updateLoanController = new UpdateLoanController();

loansRoutes.post('/', ensureAuthenticated, createLoanController.handle);
loansRoutes.put('/', ensureAuthenticated, updateLoanController.handle);

export { loansRoutes };
