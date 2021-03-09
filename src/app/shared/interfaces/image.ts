export interface Image {
  cid: string;
  filePath?: string;
  fileSize?: number; // in bytes
  hasPending: boolean;
  localURL?: string;
  serverFilename?: string;
  url: string;
}

export interface ImageRequestMetadata {
  name: string;
  blob: Blob;
  filename: string;
}

export interface ImageRequestFormData {
  name: string;
  image: Image;
}
