import { ApprovePaymentController } from '@modules/loans/useCases/approvePayment/ApprovePaymentController';
import { CreateLoanController } from '@modules/loans/useCases/createLoan/CreateLoanController';
import { CreatePaymentController } from '@modules/loans/useCases/createPayment/CreatePaymentController';
import { DeleteLoanController } from '@modules/loans/useCases/deleteLoan/DeleteLoanController';
import { ListLoansController } from '@modules/loans/useCases/listLoans/ListLoansController';
import { RefusePaymentController } from '@modules/loans/useCases/refusePayment/RefusePaymentController';
import { UpdateLoanController } from '@modules/loans/useCases/updateLoan/UpdateLoanController';
import { Router } from 'express';

import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const loansRoutes = Router();

const createLoanController = new CreateLoanController();
const updateLoanController = new UpdateLoanController();
const deleteLoanController = new DeleteLoanController();
const listLoansController = new ListLoansController();
const createPaymentController = new CreatePaymentController();
const approvePaymentController = new ApprovePaymentController();
const refusePaymentController = new RefusePaymentController();

loansRoutes.post('/', ensureAuthenticated, createLoanController.handle);
loansRoutes.put('/', ensureAuthenticated, updateLoanController.handle);
loansRoutes.delete('/', ensureAuthenticated, deleteLoanController.handle);
loansRoutes.get('/', ensureAuthenticated, listLoansController.handle);
loansRoutes.post(
  '/payment',
  ensureAuthenticated,
  createPaymentController.handle
);
loansRoutes.patch(
  '/payment/:id/approve',
  ensureAuthenticated,
  approvePaymentController.handle
);
loansRoutes.patch(
  '/payment/:id/refuse',
  ensureAuthenticated,
  refusePaymentController.handle
);

export { loansRoutes };
