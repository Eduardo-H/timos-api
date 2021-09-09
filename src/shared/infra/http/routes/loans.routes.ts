import { CreateLoanController } from '@modules/loans/useCases/createLoan/CreateLoanController';
import { Router } from 'express';

import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const loansRoutes = Router();

const createLoanController = new CreateLoanController();

loansRoutes.post('/', ensureAuthenticated, createLoanController.handle);

export { loansRoutes };
