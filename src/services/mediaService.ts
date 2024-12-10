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

const storage = new Storage({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET as string);

class MediaService {
  /**
   * Uploads a file to Google Cloud Storage and returns a URL to the uploaded file.
   * @param file The file to be uploaded.
   * @returns A URL to the uploaded file.
   * @throws ResponseError if the file is not provided.
   */
  async uploadMedia(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new ResponseError(400, "File is required");
    }
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

  /**
   * Updates an existing media by deleting the existing file and uploading a new one.
   * @param file The new file to upload.
   * @param url The URL of the existing file to delete.
   * @returns A URL to the updated file.
   * @throws ResponseError if the file is not provided, or if the URL is invalid or points to a file that does not exist.
   */
  async updateMedia(
    file: Express.Multer.File,
    url: string | null
  ): Promise<string> {
    if (!file) {
      throw new ResponseError(400, "File is required");
    }

    if (url) {
      const baseUrl = "https://storage.googleapis.com/";

      if (!url.startsWith(baseUrl)) {
        throw new ResponseError(400, "Invalid URL format");
      }

      const objectPath = url.replace(baseUrl, "");

      const bucketName = process.env.GOOGLE_STORAGE_BUCKET as string;
      if (objectPath.startsWith(bucketName)) {
        const correctPath = objectPath.replace(bucketName + "/", "");

        const blob = bucket.file(correctPath);

        const [exists] = await blob.exists();
        if (exists) {
          await blob.delete();
          console.log(`File deleted from GCS: ${correctPath}`);
        }
      } else {
        throw new ResponseError(400, "Invalid object path or bucket name");
      }
    }

    return await this.uploadMedia(file);
  }

  /**
   * Saves the given medias to the database.
   * @param medias The list of medias to save.
   * @throws ResponseError if the list of medias is empty.
   * @returns The created medias.
   */
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

  /**
   * Deletes a media by its ID.
   * @param id The ID of the media to delete.
   * @throws ResponseError if the media is not found.
   */
  async deleteMedia(id: number) {
    await prisma.images.delete({ where: { id } });
  }

  /**
   * Deletes a media by its URL.
   * @param url The URL of the media to delete.
   * @throws ResponseError if the media is not found, or if the URL is invalid or points to a file that does not exist.
   */
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

  /**
   * Deletes a media from Google Cloud Storage by its object path.
   * @param objectPath The path of the object in GCS.
   * @param url The URL of the media to delete.
   * @throws ResponseError if the media is not found in the database, or if the deletion fails.
   */

  private async deleteFromGCS(objectPath: string, url: string) {
    try {
      const imageRecord = await prisma.images.findFirst({
        where: { url },
      });

      if (!imageRecord) {
        throw new ResponseError(404, "Image not found in the database");
      }

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

  /**
   * Deletes all media associated with a specific item and type from the database and Google Cloud Storage.
   * @param itemId - The ID of the item whose media is to be deleted.
   * @param type - The type of media to delete (e.g., PRODUCT, MARKET, etc.).
   * @returns A promise that resolves when the media deletion process is complete.
   * @throws ResponseError if there is a failure in deleting media from either the database or Google Cloud Storage.
   * Logs a message if no media is found for the given item and type.
   */
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

  /**
   * Deletes a media item from Google Cloud Storage by its URL.
   * @param url - The URL of the media item to delete. Must be in the format of
   * `https://storage.googleapis.com/<bucket-name>/<object-path>`.
   * @throws ResponseError if the URL is invalid, the file is not found, or there
   * is a failure in deleting the file from Google Cloud Storage.
   */
  async deleteMediaFromGCSByUrl(url: string) {
    try {
      const baseUrl = "https://storage.googleapis.com/";

      if (!url.startsWith(baseUrl)) {
        throw new ResponseError(400, "Invalid URL format");
      }

      const objectPath = url.replace(baseUrl, "");

      const bucketName = process.env.GOOGLE_STORAGE_BUCKET as string;

      if (objectPath.startsWith(bucketName)) {
        const correctPath = objectPath.replace(bucketName + "/", "");

        const storage = new Storage({
          projectId: process.env.GOOGLE_PROJECT_ID,
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        });

        const bucket = storage.bucket(
          process.env.GOOGLE_STORAGE_BUCKET as string
        );
        const blob = bucket.file(correctPath);

        const [exists] = await blob.exists();
        if (!exists) {
          console.log(`File not found in GCS: ${correctPath}`);
          throw new ResponseError(404, "File not found in the bucket");
        }

        await blob.delete();
        console.log(`File deleted from GCS: ${correctPath}`);
      } else {
        throw new ResponseError(400, "Invalid object path or bucket name");
      }
    } catch (error) {
      console.error("Error deleting media from GCS:", error);
      throw new ResponseError(500, "Failed to delete media from GCS");
    }
  }
}

export default MediaService;
