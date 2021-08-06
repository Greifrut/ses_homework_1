import { ValidatedRequest } from 'express-joi-validation';
import { Response } from 'express';
import { get } from 'config';

import { UserControllerHandler, UserCredential } from '../types/types/UserControllerHandler';
import { IUserController } from '../types/interfaces/IUserController';
import IUserRequestSchema from '../types/interfaces/IUserSchema';
import UserService from '../services/user.service';
import Controller from './controller';
import Jwt from '../services/jwt.service';

class UserController
  extends Controller<ValidatedRequest<IUserRequestSchema>>
  implements IUserController {
  private userCredential: UserCredential = {
    email: '',
    password: '',
  };

  constructor(private userService = UserService) {
    super();
    this.process = this.process.bind(this);
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
  }

  async process(
    request: ValidatedRequest<IUserRequestSchema>,
    response: Response,
    handler: UserControllerHandler,
  ) {
    try {
      this.setRequest(request);
      this.setResponse(response);

      this.userCredential = {
        email: this.request.body.email,
        password: this.request.body.password,
      };

      const token = Jwt.create(this.userCredential);

      await handler(this.userCredential);

      this.setCookie(get('cookieName'), token);

      this.successResponse({ ...this.userCredential, token });
    } catch (e) {
      this.failedResponse(e.message);
    }
  }

  async login(request: ValidatedRequest<IUserRequestSchema>, response: Response) {
    await this.process(request, response, this.userService.login);
  }

  async register(request: ValidatedRequest<IUserRequestSchema>, response: Response) {
    await this.process(request, response, this.userService.register);
  }
}

export default new UserController();
