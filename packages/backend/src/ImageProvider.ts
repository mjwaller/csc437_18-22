// backend/src/ImageProvider.ts
import { Collection, MongoClient, ObjectId } from "mongodb";
import type { IApiImageData } from "./common/ApiImageData.js";

interface IImageDocument {
  _id:      ObjectId;
  src:      string;
  name:     string;
  authorId: string; 
}

interface IUserDocument {
  _id:      string; 
  username: string;
  email: string
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
  async getAllImages(searchTerm?: string): Promise<IApiImageData[]> {
    const pipeline: object[] = [];
  
    if (searchTerm) {
      pipeline.push({
        $match: {
          name: { $regex: searchTerm, $options: "i" }
        }
      });
    }
  
    pipeline.push(
      {
        $lookup: {
          from:       this.usersCol.collectionName,
          localField: "authorId",
          foreignField:"id",
          as:         "authorArr"
        }
      },
      { $unwind: "$authorArr" },
      {
        $project: {
          // Convert MongoDB's _id ObjectId into a string _id
          _id:    { $toString: "$_id" },
          name:   1,
          src:    1,
          author: {
            id:       "$authorArr.id",
            username: "$authorArr.username"
          }
        }
      }
    );
  
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

  async findImageByObjectId(objectId: ObjectId): Promise<IImageDocument | null> {
    return this.imagesCol.findOne({ _id: objectId });
  }
  
  async createImage(filename: string, name: string, authorUsername: string) {
    const newDoc: IImageDocument = {
      _id: new ObjectId(),
      name,
      src: `/uploads/${filename}`,
      authorId: authorUsername,
    };
    await this.imagesCol.insertOne(newDoc);
  }
  

}
