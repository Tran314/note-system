import COS from 'cos-js-sdk-v5';

const config = {
  bucket: import.meta.env.VITE_COS_BUCKET,
  region: import.meta.env.VITE_COS_REGION,
  secretId: import.meta.env.VITE_COS_SECRET_ID,
  secretKey: import.meta.env.VITE_COS_SECRET_KEY,
};

const cosClient = new COS({
  SecretId: config.secretId,
  SecretKey: config.secretKey,
});

export interface COSService {
  getJSON(path: string): Promise<any>;
  putJSON(path: string, data: any): Promise<void>;
  deleteJSON(path: string): Promise<void>;
  uploadFile(path: string, file: File): Promise<void>;
  downloadFile(path: string): Promise<Blob>;
  listObjects(prefix: string): Promise<string[]>;
}

export const cosService: COSService = {
  async getJSON(path: string): Promise<any> {
    const response = await cosClient.getObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: path,
    });
    return JSON.parse(response.Body);
  },

  async putJSON(path: string, data: any): Promise<void> {
    await cosClient.putObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: path,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
    });
  },

  async deleteJSON(path: string): Promise<void> {
    await cosClient.deleteObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: path,
    });
  },

  async uploadFile(path: string, file: File): Promise<void> {
    await cosClient.putObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: path,
      Body: file,
    });
  },

  async downloadFile(path: string): Promise<Blob> {
    const response = await cosClient.getObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: path,
    });
    return response.Body;
  },

  async listObjects(prefix: string): Promise<string[]> {
    const response = await cosClient.getBucket({
      Bucket: config.bucket,
      Region: config.region,
      Prefix: prefix,
    });
    return response.Contents?.map((item) => item.Key) || [];
  },
};
