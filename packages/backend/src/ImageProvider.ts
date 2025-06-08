import { Collection, MongoClient, ObjectId } from "mongodb";
import type { IApiImageData } from "./common/ApiImageData.js";

interface IImageDocument {
  _id:      ObjectId;
  src:      string;
  name:     string;
  authorId: string;
}

interface IUserDocument {
  _id:      string;   // note: your users collection uses a string _id
  username: string;
}

export class ImageProvider {
  private imagesCol: Collection<IImageDocument>;
  private usersCol:  Collection<IUserDocument>;

  constructor(mongoClient: MongoClient) {
    const db = mongoClient.db(process.env.DB_NAME);
    const imagesColName = process.env.IMAGES_COLLECTION_NAME;
    const usersColName  = process.env.USERS_COLLECTION_NAME;
    if (!imagesColName || !usersColName) {
      throw new Error("Missing IMAGES_COLLECTION_NAME or USERS_COLLECTION_NAME");
    }
    this.imagesCol = db.collection(imagesColName);
    this.usersCol  = db.collection(usersColName);
  }

  /** 
   * Fetch all images, optionally filtered by name.
   * Always returns an array of IApiImageData with a string `id` field.
   */
  async getAllImages(searchTerm?: string): Promise<IApiImageData[]> {
    const pipeline: object[] = [];

    if (searchTerm) {
      pipeline.push({
        $match: { name: { $regex: searchTerm, $options: "i" } }
      });
    }

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
          _id:    0,                          // drop the original BSON _id
          id:     { $toString: "$_id" },     // new string id
          src:    1,
          name:   1,
          author: {
            id:       "$authorArr._id",
            username: "$authorArr.username"
          }
        }
      }
    );

    return this.imagesCol.aggregate<IApiImageData>(pipeline).toArray();
  }

  /** Alias for getAllImages, matching earlier naming */
  getImages(searchTerm?: string) {
    return this.getAllImages(searchTerm);
  }

  /** Update an image’s name by its string `id` */
  async updateImageName(imageId: string, newName: string): Promise<number> {
    if (!ObjectId.isValid(imageId)) {
      throw new Error("Invalid image id format");
    }
    const _id = new ObjectId(imageId);
    const result = await this.imagesCol.updateOne({ _id }, { $set: { name: newName } });
    return result.matchedCount;
  }

  /** Insert a new image record */
  async createImage(filename: string, name: string, authorUsername: string): Promise<void> {
    const newDoc: IImageDocument = {
      _id:      new ObjectId(),
      src:      `/uploads/${filename}`,
      name,
      authorId: authorUsername
    };
    await this.imagesCol.insertOne(newDoc);
  }

  async findImageByObjectId(objectId: ObjectId): Promise<IImageDocument | null> {
    return this.imagesCol.findOne({ _id: objectId });
  }
}

