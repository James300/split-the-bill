import { atom, Atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export interface BaseStore<T> {
  data: Record<string, T>
  isLoading: boolean
  isError: boolean
  lastFetchedAt: number
}

export function createBaseStore<T>(storageKey: string, initialData: Record<string, T> = {}) {
  const initialStore: BaseStore<T> = {
    data: initialData,
    isLoading: false,
    isError: false,
    lastFetchedAt: 0,
  }

  const storeAtom = atomWithStorage<BaseStore<T>>(storageKey, initialStore, undefined, {
    getOnInit: true,
  })

  return storeAtom
}

export function createDataAtom<T>(storeAtom: Atom<BaseStore<T>>) {
  return atom((get) => get(storeAtom).data)
}

export function createLoadingAtom<T>(storeAtom: Atom<BaseStore<T>>) {
  return atom((get) => get(storeAtom).isLoading)
}

export function createErrorAtom<T>(storeAtom: Atom<BaseStore<T>>) {
  return atom((get) => get(storeAtom).isError)
}

export function createLastFetchedAtAtom<T>(storeAtom: Atom<BaseStore<T>>) {
  return atom((get) => get(storeAtom).lastFetchedAt)
}

export function createEntityFamily<T>(dataAtom: Atom<Record<string, T>>) {
  return (id: string) => atom((get) => get(dataAtom)[id])
}

export function getMaxUpdatedAt<T extends { updatedAt: number }>(items: T[]): number {
  if (items.length === 0) {
    return 0;
  }

  return Math.max(...items.map(item => item.updatedAt))
}
