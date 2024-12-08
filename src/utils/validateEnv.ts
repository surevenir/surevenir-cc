import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z
    .string({
      description: "MySQL database connection string",
      required_error: "😱 DATABASE_URL is required.",
    })
    .url("Invalid URL format for DATABASE_URL.")
    .min(3, "DATABASE_URL must be at least 3 characters long."),

  GOOGLE_PROJECT_ID: z
    .string({
      description: "Google Cloud project ID",
      required_error: "😱 GOOGLE_PROJECT_ID is required.",
    })
    .min(1, "GOOGLE_PROJECT_ID cannot be empty."),

  GOOGLE_APPLICATION_CREDENTIALS: z
    .string({
      description: "Path to Google Application Credentials JSON file",
      required_error: "😱 GOOGLE_APPLICATION_CREDENTIALS is required.",
    })
    .min(1, "GOOGLE_APPLICATION_CREDENTIALS cannot be empty."),

  GOOGLE_STORAGE_BUCKET: z
    .string({
      description: "Google Cloud Storage bucket name",
      required_error: "😱 GOOGLE_STORAGE_BUCKET is required.",
    })
    .min(1, "GOOGLE_STORAGE_BUCKET cannot be empty."),

  ML_API_TOKEN: z
    .string({
      description: "Token for Machine Learning API",
      required_error: "😱 ML_API_TOKEN is required.",
    })
    .min(1, "ML_API_TOKEN cannot be empty."),

  ML_API_URL: z
    .string({
      description: "URL for Machine Learning API",
      required_error: "😱 ML_API_URL is required.",
    })
    .url("Invalid URL format for ML_API_URL."),

  PORT: z.coerce
    .number({
      description: "Server port number, coerced from string to number",
    })
    .positive("PORT must be a positive number.")
    .max(65536, "PORT must be less than 65536.")
    .optional(),
});

export default EnvSchema.parse(process.env);

console.log("Environment variables:", EnvSchema.parse(process.env));
