import { IEntity } from '@/types/common.interface'

export function entityArrayToMap(response: IEntity[]): Record<string, IEntity> {
  const map: Record<string, IEntity> = {};
  for (const item of response) {
    map[item.id] = item;
  }
  return map;
}
