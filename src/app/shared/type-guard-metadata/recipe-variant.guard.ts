import { DocumentGuard } from '../interfaces';

export const RecipeVariantGuardMetadata: DocumentGuard = {
  _id:             { type: 'string' , required: false },
  cid:             { type: 'string' , required: true  },
  variantName:     { type: 'string' , required: true  },
  notes:           { type: 'string' , required: true  },
  isFavorite:      { type: 'boolean', required: true  },
  isMaster:        { type: 'boolean', required: true  },
  rating:          { type: 'number' , required: false },
  owner:           { type: 'string' , required: false },
  efficiency:      { type: 'number' , required: true  },
  brewingType:     { type: 'string' , required: true  },
  mashDuration:    { type: 'number' , required: true  },
  boilDuration:    { type: 'number' , required: true  },
  batchVolume:     { type: 'number' , required: true  },
  boilVolume:      { type: 'number' , required: true  },
  mashVolume:      { type: 'number' , required: true  },
  originalGravity: { type: 'number' , required: true  },
  finalGravity:    { type: 'number' , required: true  },
  ABV:             { type: 'number' , required: true  },
  IBU:             { type: 'number' , required: true  },
  SRM:             { type: 'number' , required: true  }
};
