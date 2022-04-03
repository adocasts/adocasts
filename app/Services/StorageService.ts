import { MultipartStream } from '@ioc:Adonis/Core/BodyParser';
import Env from '@ioc:Adonis/Core/Env';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import storageConfig from 'Config/storage';
import FileType from 'file-type'

export default class StorageService {
  public static disk = storageConfig.disk
  public static prodDirectory: string = Env.get('DO_DIRECTORY', 'public');
  public static devDirectory: string = Env.get('DO_DEV_DIRECTORY', 'local');
  public static directory: string = Env.get('NODE_ENV') != 'development' ? StorageService.prodDirectory : StorageService.devDirectory;
  public static bucket: string = Env.get('DO_SPACES_BUCKET');

  public static async upload(file: Buffer | MultipartStream, customFileName: string): Promise<string> {
    const contentType = await this.getContentType(file);

    const params = {
      ACL: "public-read",
      Key: `${this.directory}/${customFileName}`,
      ContentType: contentType,
      Bucket: this.bucket,
      Body: file
    }

    return await new Promise((resolve: (value: string) => void, reject) => {
      this.disk.upload(params, (err: Error, data: ManagedUpload.SendData) => {
        if (err) reject(err);

        resolve(data.Location);
      });
    })
  }

  public static async get(customFileName: string): Promise<string> {
    const params = {
      Bucket: this.bucket,
      Key: `${this.directory}/${customFileName}`
    }

    return await new Promise((resolve: (value: any) => void, _) => {
      const stream = this.disk.getObject(params).createReadStream()

      resolve(stream);
    });
  }

  public static async getBuffer(customFileName: string, directory: string = this.directory): Promise<Buffer> {
    const params = {
      Bucket: this.bucket,
      Key: `${directory}/${customFileName}`
    }

    return await new Promise((resolve: (value: any) => void, _) => {
      this.disk.getObject(params, function (_, data) {
        resolve(data?.Body);
      });
    });
  }

  public static async getBufferOrProd(customFileName: string): Promise<Buffer> {
    let file = await this.getBuffer(customFileName)

    if (!file) {
      file = await this.getBuffer(customFileName, this.prodDirectory)
    }

    return file;
  }

  public static async exists(customFileName: string, directory: string = this.directory): Promise<boolean> {
    const params = {
      Bucket: this.bucket,
      Key: `${directory}/${customFileName}`
    }

    return this.disk.headObject(params).promise().then(
      () => true,
      () => false
    )
  }

  public static async destroy(fileName: string, directory: string = this.directory): Promise<boolean> {
    const params = {
      Bucket: this.bucket,
      Key: `${directory}/${fileName}`
    }

    const hasError = await this.disk.deleteObject(params).promise().then(err => err)

    return !hasError
  }

  public static async destroyAll(fileNames: string[], directory: string = this.directory): Promise<boolean> {
    const params = {
      Bucket: this.bucket,
      Delete: {
        Objects: fileNames.map(fileName => ({ Key: `${directory}/${fileName}` }))
      }
    }

    const hasError = await this.disk.deleteObjects(params).promise().then(err => err)

    return !hasError
  }

  public static async getContentType(file: any) {
    if (file?.headers) {
      return file.headers['content-type']
    }
    return (await FileType.fromBuffer(file))?.mime
  }
}
