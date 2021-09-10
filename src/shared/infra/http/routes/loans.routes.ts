import { CreateLoanController } from '@modules/loans/useCases/createLoan/CreateLoanController';
import { DeleteLoanController } from '@modules/loans/useCases/deleteLoan/DeleteLoanController';
import { ListLoansController } from '@modules/loans/useCases/listLoans/ListLoansController';
import { UpdateLoanController } from '@modules/loans/useCases/updateLoan/UpdateLoanController';
import { Router } from 'express';

import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const loansRoutes = Router();

const createLoanController = new CreateLoanController();
const updateLoanController = new UpdateLoanController();
const deleteLoanController = new DeleteLoanController();
const listLoansController = new ListLoansController();

loansRoutes.post('/', ensureAuthenticated, createLoanController.handle);
loansRoutes.put('/', ensureAuthenticated, updateLoanController.handle);
loansRoutes.delete('/', ensureAuthenticated, deleteLoanController.handle);
loansRoutes.get('/', ensureAuthenticated, listLoansController.handle);

export { loansRoutes };
