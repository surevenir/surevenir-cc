import { Storage } from "@google-cloud/storage";
import { cloudStorageKey } from "../credentials/credentials";

const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  credentials: cloudStorageKey,
});

const bucketName = process.env.BUCKET_NAME;
const bucket = storage.bucket(bucketName as string);

export async function uploadImageToBucket(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const gcsFile = bucket.file(fileName);

  try {
    // Upload file ke bucket
    await gcsFile.save(fileBuffer, {
      metadata: { contentType: mimeType },
    });

    // Set file menjadi publik
    await gcsFile.makePublic();

    // URL publik file
    return `https://storage.googleapis.com/${bucketName}/${fileName}`;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Failed to upload file to GCP Bucket");
  }
}
