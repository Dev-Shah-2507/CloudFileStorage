import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

// This automatically picks up the temporary keys from your .env file
export const s3Client = new S3Client({
    region: process.env.AWS_REGION
});