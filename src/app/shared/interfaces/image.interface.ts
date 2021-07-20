export interface Image {
  cid: string;
  filePath?: string;
  fileSize?: number;
  hasPending: boolean;
  localURL?: string;
  serverFilename?: string;
  url: string;
}
