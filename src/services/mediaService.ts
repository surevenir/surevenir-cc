import { Storage } from "@google-cloud/storage";
import prisma from "../config/database";
import ResponseError from "../utils/responseError";

class MediaService {
  async uploadMedia(file: Express.Multer.File) {
    const storage = new Storage({
      projectId: process.env.GOOGLE_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET as string);

    return new Promise((resolve, reject) => {
      try {
        if (!file) throw new ResponseError(400, "File is required");

        console.log("Uploading file:", file.originalname);
        const uniqueIdentifier = Date.now();
        const blob = bucket.file(`${uniqueIdentifier}_${file.originalname}`);
        const blobStream = blob.createWriteStream();

        blobStream.on("finish", () => {
          console.log("Success uploading file" + file.originalname);
          const result = `${storage.apiEndpoint}/${bucket.name}/${uniqueIdentifier}_${file.originalname}`;
          resolve(result);
        });

        blobStream.end(file.buffer);
      } catch (error) {
        console.log("Error when uploading file: ", error);
        reject(error);
      }
    });
  }

  async saveMedia(itemId: number, url: string) {
    return await prisma.images.create({
      data: {
        url,
        item_id: itemId,
      },
    });
  }

  async deleteMedia(id: number) {
    await prisma.images.delete({ where: { id } });
  }
}

export default MediaService;
