// backend/src/ImageProvider.ts
import { Collection, MongoClient, ObjectId } from "mongodb";
import type { IApiImageData } from "./common/ApiImageData.js";

interface IImageDocument {
  _id:      ObjectId;   // Mongo’s ObjectId
  src:      string;
  name:     string;
  authorId: string; 
}

interface IUserDocument {
  _id:      string; 
  username: string;
  email: string
  // (you can also include email, etc., if you like)
}

export class ImageProvider {
  private imagesCol: Collection<IImageDocument>;
  private usersCol:  Collection<IUserDocument>;

  constructor(mongoClient: MongoClient) {
    const db = mongoClient.db(process.env.DB_NAME);
    const imagesColName = process.env.IMAGES_COLLECTION_NAME;
    const usersColName  = process.env.USERS_COLLECTION_NAME;
    if (!imagesColName || !usersColName) {
      throw new Error(
        "Missing IMAGES_COLLECTION_NAME or USERS_COLLECTION_NAME in .env"
      );
    }
    this.imagesCol = db.collection<IImageDocument>(imagesColName);
    this.usersCol  = db.collection<IUserDocument>(usersColName);
  }

  /** 
   * Returns an array of IApiImageData, with author denormalized into { id, username } 
   */
  async getAllImages(): Promise<IApiImageData[]> {
    const pipeline = [
      // 1) Look up user by matching authorId -> user._id
      {
        $lookup: {
          from:       this.usersCol.collectionName,
          localField: "authorId",
          foreignField: "_id",      // <– changed from "id" to "_id"
          as:         "authorArr"
        }
      },
      // 2) Flatten the array (there should be exactly one match per document)
      { $unwind: "$authorArr" },

      // 3) Project exactly the fields we want in our API:
      {
        $project: {
          _id: 0,
          // Convert the image’s ObjectId to a string and call it "id"
          id:   { $toString: "$_id" },
          name: 1,
          src:  1,
          author: {
            id:       "$authorArr._id",      // user’s _id is already a string
            username: "$authorArr.username"
          }
        }
      }
    ];

    return this.imagesCol.aggregate<IApiImageData>(pipeline).toArray();
  }

  /**
   * (Later, when you build a search feature:)
   *   Accepts an optional searchTerm. If provided, only return docs whose name matches the regex.
   */
  async getImages(searchTerm?: string): Promise<IApiImageData[]> {
    const pipeline: object[] = [];

    // If the caller passed a search term, add a match stage first:
    if (searchTerm) {
      pipeline.push({
        $match: {
          name: { $regex: searchTerm, $options: "i" }
        }
      });
    }

    // Then do the same $lookup / $unwind / $project as above:
    pipeline.push(
      {
        $lookup: {
          from:       this.usersCol.collectionName,
          localField: "authorId",
          foreignField: "_id",
          as:         "authorArr"
        }
      },
      { $unwind: "$authorArr" },
      {
        $project: {
          _id: 0,
          id:   { $toString: "$_id" },
          name: 1,
          src:  1,
          author: {
            id:       "$authorArr._id",
            username: "$authorArr.username"
          }
        }
      }
    );

    return this.imagesCol.aggregate<IApiImageData>(pipeline).toArray();
  }

  /**
   * The updateImageName method you will implement in the next lab:
   */
  async updateImageName(imageId: string, newName: string): Promise<number> {
    if (!ObjectId.isValid(imageId)) {
      throw new Error("Invalid ObjectId format");
    }
    const _id = new ObjectId(imageId);
    const result = await this.imagesCol.updateOne({ _id }, { $set: { name: newName } });

    return result.matchedCount;
  }
}
