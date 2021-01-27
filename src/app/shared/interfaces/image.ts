export interface Image {
  cid: string;
  filePath?: string;
  fileSize?: number; // in bytes
  localURL?: string;
  serverFilename?: string;
  url: string;
}

export interface PendingImageFlag {
  itemLabelImage: {
    hasPending: boolean;
    hasTemp: boolean;
  };
  supplierLabelImage: {
    hasPending: boolean;
    hasTemp: boolean;
  };
}
