import { Request, Response } from 'express';
import { get } from 'config';
import Jwt from '../services/jwt.service';
import User from '../services/user.service';
import AuthTypes from '../types/enums/AuthTypes';
import IProtected from '../types/interfaces/IProtected';

class Protected implements IProtected {
  private req: Request;

  private res: Response;

  private readonly tokenKey: string = get('cookieName');

  async isValidAuth(req: Request, res: Response, next) {
    try {
      this.req = req;
      this.res = res;

      if (this.hasTokenInCookies()) {
        await this.checkCookies();
      } else {
        await this.isAuthTypeValid();
      }

      next();
    } catch (e) {
      res.status(404).send(e.message);
    }
  }

  private hasTokenInCookies(): boolean {
    return this.tokenKey in this.req.cookies;
  }

  private async checkCookies() {
    const token = this.req.cookies[this.tokenKey];
    await this.bearer({ token });
  }

  private async bearer({ token = this.getAuthorizationValue() }) {
    await Jwt.verify(token);
  }

  private async isAuthTypeValid() {
    const authType: AuthTypes | null = this.getAuthTypeFromRequestHeader();

    if (!authType) this.res.status(404).send('Provide valid authorization');

    const verifier = this.getVerifier(authType);

    await verifier();
  }

  private getAuthTypeFromRequestHeader(): AuthTypes {
    const { headers: { authorization } } = this.req;

    if (!authorization) return null;

    const reqAuthType: any = authorization.split(' ')[0];

    if (!Object.values(AuthTypes).includes(reqAuthType)) return null;

    return AuthTypes[reqAuthType];
  }

  private getAuthorizationValue(): string {
    const { headers: { authorization } } = this.req;

    if (!authorization) return null;

    return authorization.split(' ')[1];
  }

  private async basic() {
    const basicAuth = Buffer.from(this.getAuthorizationValue(), 'base64').toString();
    const [email, password] = basicAuth.split(':');

    await User.login({ email, password });

    return true;
  }

  private getVerifier(authType: AuthTypes) {
    return this[`${authType.toLowerCase()}`].bind(this);
  }
}

export default new Protected();
