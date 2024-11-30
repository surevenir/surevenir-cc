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

  async deleteMediaByUrl(url: string) {
    try {
      // Memastikan URL dimulai dengan https://storage.googleapis.com/
      const baseUrl = "https://storage.googleapis.com/";

      if (!url.startsWith(baseUrl)) {
        throw new ResponseError(400, "Invalid URL format");
      }

      // Menghapus baseUrl dari URL untuk mendapatkan path objek di bucket
      const objectPath = url.replace(baseUrl, "");

      // Memastikan hanya ada satu instance nama bucket di path
      const bucketName = process.env.GOOGLE_STORAGE_BUCKET as string;
      if (objectPath.startsWith(bucketName)) {
        // Hapus nama bucket dari path jika ada (misalnya "surevenir-gcs-bucket/")
        const correctPath = objectPath.replace(bucketName + "/", "");
        await this.deleteFromGCS(correctPath, url);
      } else {
        throw new ResponseError(400, "Invalid object path or bucket name");
      }
    } catch (error) {
      console.error("Error deleting media:", error);
      throw new ResponseError(500, "Failed to delete media");
    }
  }

  // Fungsi untuk menghapus file dari GCS dan database
  private async deleteFromGCS(objectPath: string, url: string) {
    try {
      // Mencari media berdasarkan URL di database
      const imageRecord = await prisma.images.findFirst({
        where: { url },
      });

      if (!imageRecord) {
        throw new ResponseError(404, "Image not found in the database");
      }

      // Menginisialisasi Google Cloud Storage client
      const storage = new Storage({
        projectId: process.env.GOOGLE_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });

      const bucket = storage.bucket(
        process.env.GOOGLE_STORAGE_BUCKET as string
      );
      const blob = bucket.file(objectPath);

      // Menghapus file dari Google Cloud Storage (GCS)
      await blob.delete();
      console.log(`File deleted from GCS: ${objectPath}`);

      // Menghapus data media dari database
      await prisma.images.delete({
        where: { id: imageRecord.id },
      });

      console.log(`File and record deleted successfully: ${url}`);
    } catch (error) {
      console.error("Error deleting from GCS:", error);
      throw new ResponseError(500, "Failed to delete from GCS");
    }
  }
}

export default MediaService;
