import { Storage } from "@google-cloud/storage";
import prisma from "../config/database";
import ResponseError from "../utils/responseError";

export enum MediaType {
  PRODUCT = "product",
  MARKET = "market",
  REVIEW = "review",
  MERCHANT = "merchant",
}

export type MediaData = {
  url: string;
  itemId: number;
  type: MediaType;
};

class MediaService {
  async uploadMedia(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new ResponseError(400, "File is required");
    }

    const storage = new Storage({
      projectId: process.env.GOOGLE_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET as string);
    console.log("Bucket:", bucket.name);

    return new Promise((resolve, reject) => {
      const uniqueIdentifier = Date.now();
      const blob = bucket.file(`${uniqueIdentifier}_${file.originalname}`);
      const blobStream = blob.createWriteStream();

      blobStream.on("finish", () => {
        console.log(`File uploaded successfully: ${file.originalname}`);
        const result = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(result);
      });

      blobStream.on("error", (error) => {
        console.error("Error during file upload:", error);
        reject(new Error("Failed to upload file"));
      });

      blobStream.end(file.buffer);
    });
  }

  async saveMedias(medias: MediaData[]) {
    if (medias.length === 0) {
      throw new ResponseError(400, "Media is empty");
    }

    const data = medias.map((media) => ({
      url: media.url,
      item_id: media.itemId,
      type: media.type,
    }));

    return await prisma.images.createMany({
      data,
    });
  }

  async deleteMedia(id: number) {
    await prisma.images.delete({ where: { id } });
  }
}

export default MediaService;
