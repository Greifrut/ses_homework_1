import { Response } from 'express';
import { ValidatedRequest } from 'express-joi-validation';
import Btc from '../services/btc';
import Controller from './controller';
import IUserRequestSchema from '../types/interfaces/IUserSchema';

class BTCController extends Controller {
  async process(request: ValidatedRequest<IUserRequestSchema>, response: Response) {
    try {
      this.setRequest(request);
      this.setResponse(response);

      this.successResponse(await this.getData());
    } catch (e) {
      this.failedResponse(e.message);
    }
  }

  getData() {
    const { coins = 1 } = this.request.query;
    return Btc.getPrice({ coins });
  }
}

export default new BTCController();
