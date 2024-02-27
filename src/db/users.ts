import { RecordType, Store } from './store';
import { pbkdf2, randomBytes } from 'crypto';

export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
}

export class Users extends Store {
  private async getAllUsersFormFS(): Promise<IUser[]> {
    const usersString = await this.readFileFromRecordType(RecordType.USERS);
    if (!usersString) {
      return [];
    }
    return JSON.parse(usersString) as IUser[];
  }
  public async createUser(user: Omit<IUser, 'id'>): Promise<IUser | null> {
    try {
      const hashedPass = await this.hashPassword(user.password);

      const newUser: IUser = {
        ...user,
        password: hashedPass,
        id: this.generateRandomId(),
      };

      const allUsers = await this.getAllUsersFormFS();

      if (allUsers.find((user) => user.email === newUser.email)) {
        console.log('Email already exists');
        return null;
      }

      const success = await this.writeFileFromRecordType(RecordType.USERS, [
        ...allUsers,
        newUser,
      ]);

      if (!success) {
        return null;
      }

      newUser.password = '';

      return newUser;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  public async findUserByEmail(
    email: string,
  ): Promise<Omit<IUser, 'password'> | null> {
    const users = await this.getAllUsersFormFS();
    const foundUser = users.find((user) => user.email === email);
    if (!foundUser) {
      return null;
    }

    return {
      email: foundUser.email,
      id: foundUser.id,
      name: foundUser.name,
    };
  }

  public async signIn(
    data: Pick<IUser, 'email' | 'password'>,
  ): Promise<Omit<IUser, 'password'> | null> {
    const users = await this.getAllUsersFormFS();
    const foundUser = users.find((u) => u.email === data.email);
    if (!foundUser) {
      console.log('user not found');
      return null;
    }

    const isPasswordCorrect = await this.comparePasswords(
      data.password,
      foundUser.password,
    );

    if (!isPasswordCorrect) {
      console.log('Password is incorrect');
      return null;
    }

    return { email: foundUser.email, id: foundUser.id, name: foundUser.name };
  }

  private async hashPassword(
    password: string,
    salt = randomBytes(16).toString('hex'),
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Parameters: password, salt, iterations, key length, digest algorithm, callback
      pbkdf2(password, salt, 100000, 64, 'sha256', (err, derivedKey) => {
        if (err) reject(err);
        // Combine the salt and derived key (hash) as the final output
        resolve(salt + ':' + derivedKey.toString('hex'));
      });
    });
  }

  private async hashPasswordWithSalt(
    password: string,
    salt: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      pbkdf2(password, salt, 100000, 64, 'sha256', (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey.toString('hex'));
      });
    });
  }

  private async comparePasswords(
    submittedPassword: string,
    storedHash: string,
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        // Split the stored hash to extract the salt
        const [salt, originalHash] = storedHash.split(':');

        // Hash the submitted password with the extracted salt
        const hashedPassword = await this.hashPasswordWithSalt(
          submittedPassword,
          salt,
        );

        // Compare the newly hashed password with the original hash
        resolve(hashedPassword === originalHash);
      } catch (err) {
        reject(err);
      }
    });
  }
}
