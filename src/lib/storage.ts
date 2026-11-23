import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const required = ["S3_BUCKET", "S3_ENDPOINT", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"] as const;
export function assertStorageConfigured() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Storage configuration missing: ${missing.join(", ")}`);
}

let client: S3Client | null = null;
export function getS3Client() {
  assertStorageConfigured();
  if (!client) {
    client = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: false,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}

export async function uploadObject(key: string, body: Buffer, contentType: string) {
  await getS3Client().send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!, Key: key, Body: body, ContentType: contentType,
  }));
}

export async function createReadUrl(key: string, expiresIn = 3600) {
  return getSignedUrl(getS3Client(), new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }), { expiresIn });
}

export async function deleteObject(key: string) {
  await getS3Client().send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }));
}

export async function moveObject(sourceKey: string, destinationKey: string) {
  const bucket = process.env.S3_BUCKET!;
  const copySource = `${bucket}/${sourceKey.split("/").map(encodeURIComponent).join("/")}`;
  await getS3Client().send(new CopyObjectCommand({
    Bucket: bucket,
    Key: destinationKey,
    CopySource: copySource,
  }));
  await deleteObject(sourceKey);
}
