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

  async updateMedia(
    file: Express.Multer.File,
    url: string | null
  ): Promise<string> {
    if (!file) {
      throw new ResponseError(400, "File is required");
    }

    try {
      // Jika URL diberikan dan ada file yang perlu dihapus
      if (url) {
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

          // Menginisialisasi Google Cloud Storage client
          const storage = new Storage({
            projectId: process.env.GOOGLE_PROJECT_ID,
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          });

          const bucket = storage.bucket(
            process.env.GOOGLE_STORAGE_BUCKET as string
          );
          const blob = bucket.file(correctPath);

          // Mengecek apakah file ada di GCS
          const [exists] = await blob.exists();
          if (exists) {
            // Menghapus file dari Google Cloud Storage (GCS)
            await blob.delete();
            console.log(`File deleted from GCS: ${correctPath}`);
          }
        } else {
          throw new ResponseError(400, "Invalid object path or bucket name");
        }
      }

      // Upload file baru ke GCS
      const uniqueIdentifier = Date.now(); // Gunakan timestamp untuk nama file unik
      const storage = new Storage({
        projectId: process.env.GOOGLE_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });

      const bucket = storage.bucket(
        process.env.GOOGLE_STORAGE_BUCKET as string
      );
      const newBlob = bucket.file(`${uniqueIdentifier}_${file.originalname}`);
      const blobStream = newBlob.createWriteStream();

      return new Promise((resolve, reject) => {
        blobStream.on("finish", () => {
          const newUrl = `https://storage.googleapis.com/${bucket.name}/${newBlob.name}`;
          console.log(`File uploaded successfully: ${file.originalname}`);
          resolve(newUrl);
        });

        blobStream.on("error", (error) => {
          console.error("Error during file upload:", error);
          reject(new Error("Failed to upload file"));
        });

        blobStream.end(file.buffer);
      });
    } catch (error) {
      console.error("Error updating media:", error);
      throw new ResponseError(500, "Failed to update media");
    }
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
      const baseUrl = "https://storage.googleapis.com/";

      if (!url.startsWith(baseUrl)) {
        throw new ResponseError(400, "Invalid URL format");
      }

      const objectPath = url.replace(baseUrl, "");

      const bucketName = process.env.GOOGLE_STORAGE_BUCKET as string;
      if (objectPath.startsWith(bucketName)) {
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
      const imageRecord = await prisma.images.findFirst({
        where: { url },
      });

      if (!imageRecord) {
        throw new ResponseError(404, "Image not found in the database");
      }

      const storage = new Storage({
        projectId: process.env.GOOGLE_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });

      const bucket = storage.bucket(
        process.env.GOOGLE_STORAGE_BUCKET as string
      );
      const blob = bucket.file(objectPath);

      await blob.delete();
      console.log(`File deleted from GCS: ${objectPath}`);

      await prisma.images.delete({
        where: { id: imageRecord.id },
      });

      console.log(`File and record deleted successfully: ${url}`);
    } catch (error) {
      console.error("Error deleting from GCS:", error);
      throw new ResponseError(500, "Failed to delete from GCS");
    }
  }

  async deleteMediaForItem(itemId: number, type: MediaType): Promise<void> {
    try {
      const mediasToDelete = await prisma.images.findMany({
        where: {
          item_id: itemId,
          type: type,
        },
      });

      if (mediasToDelete.length === 0) {
        console.log("No media found for deletion.");
        return;
      }

      const storage = new Storage({
        projectId: process.env.GOOGLE_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });

      const bucket = storage.bucket(
        process.env.GOOGLE_STORAGE_BUCKET as string
      );

      for (const media of mediasToDelete) {
        if (media.url) {
          const objectPath = media.url.replace(
            `https://storage.googleapis.com/${bucket.name}/`,
            ""
          );
          await this.deleteFromGCS(objectPath, media.url);
        } else {
          console.warn(`Media URL is null for item_id: ${media.item_id}`);
        }
      }

      console.log(`${mediasToDelete.length} media items deleted successfully.`);
    } catch (error) {
      console.error("Error deleting media for item:", error);
      throw new ResponseError(500, "Failed to delete media for item");
    }
  }
}

export default MediaService;
