// /packages/backend/src/CredentialsProvider.ts

import { Collection, MongoClient } from "mongodb";
import bcrypt from "bcrypt";

interface ICredDocument {
  /** We store the username as _id (so lookups are fast). */
  _id: string;
  username: string;
  /** This field will be the bcrypt‐generated hash (which already includes the salt). */
  password: string;
}

export class CredentialsProvider {
  private col: Collection<ICredDocument>;

  constructor(mongoClient: MongoClient) {
    const dbName = process.env.DB_NAME;
    if (!dbName) {
      throw new Error("Missing DB_NAME in .env");
    }
    const db = mongoClient.db(dbName);

    const credsColName = process.env.CREDS_COLLECTION_NAME;
    if (!credsColName) {
      throw new Error("Missing CREDS_COLLECTION_NAME in .env");
    }
    this.col = db.collection<ICredDocument>(credsColName);
  }

  /**
   * Attempts to register a new user with the given username & plaintext password.
   * Returns false if the username is already taken; otherwise, salts+hashes the password,
   * inserts a document, and returns true.
   */
  async registerUser(username: string, password: string): Promise<boolean> {
    // 1) Check if username already exists
    const existing = await this.col.findOne({ _id: username });
    if (existing) {
      return false;
    }

    // 2) Generate a salt (bcrypt.genSalt(10)) and hash(password, salt)
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // 3) Insert into collection: { _id: username, username, password: hashed }
    await this.col.insertOne({
      _id: username,
      username,
      password: hashed,
    });

    return true;
  }

  /**
   * Returns true if that username exists AND the plaintext password matches
   * the stored bcrypt hash. Otherwise false.
   */
  async verifyUser(username: string, password: string): Promise<boolean> {
    // 1) Look up the stored document
    const record = await this.col.findOne({ _id: username });
    if (!record) {
      return false; // no such user
    }

    // 2) Compare the plaintext `password` against record.password (bcrypt hash)
    const isMatch = await bcrypt.compare(password, record.password);
    return isMatch;
  }
}
