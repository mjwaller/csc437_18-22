// /packages/backend/src/CredentialsProvider.ts

import { Collection, MongoClient } from "mongodb";
import bcrypt from "bcrypt";

interface IUserCreds {
    _id: string;         // username as the document _id
    username: string;
    password: string;    // salted+hashed
  }
  
  interface IUserProfile {
    _id: string;         // same as username
    username: string;
    email: string;
  }

export class CredentialsProvider {
    private credsCol: Collection<IUserCreds>;
    private usersCol: Collection<IUserProfile>;

    constructor(private readonly mongoClient: MongoClient) {
        const db = this.mongoClient.db(process.env.DB_NAME);
        const credsName = process.env.CREDS_COLLECTION_NAME!;
        const usersName = process.env.USERS_COLLECTION_NAME!;
    
        this.credsCol = db.collection<IUserCreds>(credsName);
        this.usersCol = db.collection<IUserProfile>(usersName);
      }

      async registerUser(username: string, plaintextPassword: string): Promise<boolean> {
        // 1) check for existing
        const existing = await this.credsCol.findOne({ _id: username });
        if (existing) return false;
    
        // 2) hash
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(plaintextPassword, salt);
    
        // 3) insert credentials
        await this.credsCol.insertOne({
          _id: username,
          username,
          password: hashed,
        });
    
        // 4) ALSO insert into users collection
        await this.usersCol.insertOne({
          _id: username,
          username,
          email: `${username}@example.com`,
        });
    
        return true;
      }
  /**
   * Returns true if that username exists AND the plaintext password matches
   * the stored bcrypt hash. Otherwise false.
   */
  async verifyUser(username: string, password: string): Promise<boolean> {
    // 1) Look up the stored credentials document
    const record = await this.credsCol.findOne({ _id: username });
    if (!record) {
      // user not found
      return false;
    }

    // 2) Compare the plaintext password against the stored bcrypt hash
    const isMatch = await bcrypt.compare(password, record.password);
    return isMatch;
  }
}
