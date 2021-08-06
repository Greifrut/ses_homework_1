import { IDb, IDbConnector } from '../types/interfaces/IDB';
import { Predicate } from '../types/types/DBConnectorPredicat';
import FileDB from './fileDB';

class Database implements IDbConnector {
  private database: IDb = FileDB;

  use(database: IDb): IDbConnector {
    this.database = database;
    return this;
  }

  createTable(name: string): boolean {
    return this.database.createTable(name);
  }

  query<T>(): T[] {
    return this.database.query<T>();
  }

  write<T>(dbName: string, data: T): Promise<T | null> {
    return this.database.write<T>(dbName, data);
  }

  read(dbName: string): Promise<IDb> {
    return this.database.read(dbName);
  }

  where(predicate: Predicate): IDb {
    return this.database.where(predicate);
  }
}

export default new Database();
