import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const r2 = process.env.R2_ACCOUNT_ID
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export async function createPresignedUploadUrl(
  userId: string,
  appId: string,
  contentType = 'audio/m4a'
) {
  if (!r2 || !process.env.R2_BUCKET) {
    return {
      key: `dev/${userId}/${randomUUID()}.m4a`,
      uploadUrl: 'https://example.com/stub-upload',
      stub: true,
    };
  }

  const key = `${appId}/${userId}/${randomUUID()}.m4a`;
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 600 });
  return { key, uploadUrl, stub: false };
}
