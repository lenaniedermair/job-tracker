import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const OCI_NAMESPACE = process.env.OCI_NAMESPACE!;
const OCI_REGION = process.env.OCI_REGION!;
const OCI_BUCKET_NAME = process.env.OCI_BUCKET_NAME!;

// OCI Object Storage S3 Compatibility Endpoint Format:
// https://<namespace>.compat.objectstorage.<region>.oraclecloud.com
const s3Client = new S3Client({
  region: OCI_REGION,
  endpoint: `https://${OCI_NAMESPACE}.compat.objectstorage.${OCI_REGION}.oraclecloud.com`,
  credentials: {
    accessKeyId: process.env.OCI_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.OCI_S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Erforderlich für OCI S3 Endpunkte
});

/**
 * Generiert eine Presigned URL für den direkten Upload vom Client zu OCI Object Storage (Client-side Direct Upload)
 */
export async function getPresignedUploadUrl(
  fileKey: string,
  contentType: string,
  expiresInSeconds = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: OCI_BUCKET_NAME,
    Key: fileKey,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Generiert eine temporäre Presigned URL zum sicheren Betrachten/Herunterladen von Dokumenten
 */
export async function getPresignedDownloadUrl(
  fileKey: string,
  expiresInSeconds = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: OCI_BUCKET_NAME,
    Key: fileKey,
  });

  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Löscht eine Datei aus dem OCI Bucket
 */
export async function deleteFileFromOCI(fileKey: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: OCI_BUCKET_NAME,
    Key: fileKey,
  });

  await s3Client.send(command);
}