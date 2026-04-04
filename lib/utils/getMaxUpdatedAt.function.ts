import { ITimestamped } from '@/types/common.interface'

export function getMaxUpdatedAt (entities: ITimestamped[]) {
  let maxUpdatedAt = 0;

  for (let i = 0; i < entities.length; i++) {
    if (maxUpdatedAt < entities[i].updatedAt) {
      maxUpdatedAt = entities[i].updatedAt
    }
  }

  return maxUpdatedAt;
}
