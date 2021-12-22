/* Interface imports */
import { GrainBill, HopsSchedule, IngredientUpdateEvent, YeastBatch } from '../../src/app/shared/interfaces';

/* Mock Imports */
import { mockGrainBill } from './mock-grain-bill';
import { mockHopsSchedule } from './mock-hops-schedule';
import { mockYeastBatch } from './mock-yeast-batch';


export const mockIngredientUpdateEvent: (type: string, addUpdate?: boolean, index?: number, deleteIngredient?: boolean) => IngredientUpdateEvent = (type: string = 'grains', addUpdate: boolean = false, index = -1, deleteIngredient = false): IngredientUpdateEvent => {
  let ingredient: GrainBill | HopsSchedule | YeastBatch | { delete: true };
  let update: GrainBill | HopsSchedule | YeastBatch = null;
  if (type === 'grains') {
    const _mockGrainBill: GrainBill = mockGrainBill()[0];
    _mockGrainBill.quantity += 1;
    ingredient = _mockGrainBill;
    if (addUpdate) {
      update = _mockGrainBill;
    }
  } else if (type === 'hops') {
    const _mockHopsSchedule: HopsSchedule = mockHopsSchedule()[0];
    _mockHopsSchedule.quantity += 1;
    ingredient = _mockHopsSchedule;
    if (addUpdate) {
      update = _mockHopsSchedule;
    }
  } else if (type === 'yeast') {
    const _mockYeastBatch: YeastBatch = mockYeastBatch()[0];
    _mockYeastBatch.quantity += 1;
    ingredient = _mockYeastBatch;
    if (addUpdate) {
      update = _mockYeastBatch;
    }
  }
  const mock: IngredientUpdateEvent = {
    ingredient,
    type
  };
  if (update) {
    Object.assign(mock, { toUpdate: update });
  }
  if (index !== -1) {
    Object.assign(mock, { index });
  }
  if (deleteIngredient) {
    mock.ingredient = { delete: true };
  }
  return mock;
};
