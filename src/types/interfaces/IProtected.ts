import { Request, Response } from 'express';

interface IProtected {
  isValidAuth (req: Request, res: Response, next: Function) : Promise<void>;
}

export default IProtected;
