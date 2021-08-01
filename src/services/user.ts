import Db from '../db/fileDB';

interface IUser {
  email: string,
  password: string
}

class User {
  dbName: string = 'users';

  async login({ email, password }: IUser) {
    const userDb = await Db.read(this.dbName);
    const user = userDb.where('email', email).query()[0];

    if (!user) throw new Error("UserService doesn't exist");

    if (user.password !== password) throw new Error('Wrong password');
  }

  async register(userCredentials: IUser) {
    const userDb = await Db.read(this.dbName);
    const existingUser = userDb.where('email', userCredentials.email).query();

    if (existingUser.length > 0) throw new Error('UserService exist');

    const user = await Db.write<IUser>(this.dbName, userCredentials);

    if (!user) {
      throw new Error('Internal Server Error');
    }
    return user;
  }
}

export default new User();
