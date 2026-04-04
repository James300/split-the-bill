import { IEntity } from '@/types/common.interface'

export function createNotFoundEntity(id: string | number): Partial<IEntity> {
  return {
    id,
    error: { status: 404, message: 'Entity not found' }
  }
}
