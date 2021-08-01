import { sign, verify } from 'jsonwebtoken';
import * as config from 'config';
import Db from '../db/fileDB';
import { User } from '../types/types/User';
import { PrivateToken } from '../types/types/PrivateToken';

interface IPubToken {
  email: string,
  privateToken: string
}

class Jwt {
  private readonly publicSecret: string = config.get('jwt.publicTokenSecret');

  private readonly privateSecret: string = config.get('jwt.privateTokenSecret');

  create({ email, password }) {
    const privateToken = sign({
      password,
    }, this.privateSecret, { expiresIn: '168h' });

    return sign({
      email,
      privateToken,
    }, this.publicSecret);
  }

  async verify(pubToken: string) {
    try {
      const { email, privateToken } = this.decodeToken<IPubToken>(pubToken);

      Jwt.isAuthValid(() => !!email && !!privateToken);

      const user = await Jwt.getUser(email);

      Jwt.isAuthValid(() => !!user);

      const { password, exp } = this.decodeToken<PrivateToken>(privateToken);

      Jwt.isAuthValid(() => password !== user.password);
      Jwt.isAuthValid(() => Date.now() > this.tokenExpireDate(exp));
    } catch (e) {
      throw new Error(e.message);
    }
  }

  private tokenExpireDate = (exp) => exp * 1000;

  static isAuthValid(paramsIsNotNull): boolean {
    if (paramsIsNotNull()) return true;

    throw new Error('Authorization failed. Please provide valid token');
  }

  private decodeToken<T>(token: string): T {
    return verify(token, this.publicSecret) as T;
  }

  static async getUser(email): Promise<User> {
    const userDB = await Db.read('users');

    // @ts-ignore
    const userHandler = <User>(user: User) => user.email === email;

    return userDB.where(userHandler).query<User>()[0];
  }
}

export default new Jwt();
