import { DocumentGuard } from '../interfaces';

export const InventoryItemGuardMetadata: DocumentGuard = {
  _id:             { type: 'string', required: false },
  createdAt:       { type: 'string', required: false },
  updatedAt:       { type: 'string', required: false },
  cid:             { type: 'string', required: true  },
  supplierName:    { type: 'string', required: true  },
  stockType:       { type: 'string', required: true  },
  initialQuantity: { type: 'number', required: true  },
  currentQuantity: { type: 'number', required: true  },
  description:     { type: 'string', required: true  },
  itemName:        { type: 'string', required: true  },
  itemStyleId:     { type: 'string', required: true  },
  itemStyleName:   { type: 'string', required: true  },
  itemABV:         { type: 'number', required: true  },
  sourceType:      { type: 'string', required: true  }
};
