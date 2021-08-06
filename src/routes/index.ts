import { Router } from 'express';
import 'joi-extract-type';
import {
  createValidator,
} from 'express-joi-validation';

import userSchema from '../schemas/user';
import BTCController from '../controllers/btcController';
import Protected from '../middlewares/protected';
import UserController from '../controllers/userController';

const router = Router();
const validator = createValidator();

router.get('/btcRate', Protected.isValidAuth.bind(Protected), BTCController.process);

router.post('/user/login', validator.body(userSchema), UserController.login);

router.post('/user/create', validator.body(userSchema), UserController.register);

export default router;
