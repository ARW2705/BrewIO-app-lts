import { DocumentGuard } from '../interfaces';

export const ImageGuardMetadata: DocumentGuard = {
  cid:            { type: 'string' , required: true  },
  filePath:       { type: 'string' , required: false },
  fileSize:       { type: 'number' , required: false },
  hasPending:     { type: 'boolean', required: true  },
  localURL:       { type: 'string' , required: false },
  serverFilename: { type: 'string' , required: false },
  url:            { type: 'string' , required: true  }
};
