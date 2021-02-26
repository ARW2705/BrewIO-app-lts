export interface Image {
  cid: string;
  filePath?: string;
  fileSize?: number; // in bytes
  localURL?: string;
  serverFilename?: string;
  url: string;
}

export interface PendingImageFlag {
  name: string;
  hasPending: boolean;
  hasTemp: boolean;
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
