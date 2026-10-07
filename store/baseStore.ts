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

  // Use the same initial state on the server and the first client render, then
  // let atomWithStorage hydrate persisted data after mount.
  const storeAtom = atomWithStorage<BaseStore<T>>(storageKey, initialStore, undefined, {
    getOnInit: false,
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
  const atomsById = new Map<string, Atom<T | undefined>>()

  return (id: string) => {
    const existingAtom = atomsById.get(id)
    if (existingAtom) {
      return existingAtom
    }

    const entityAtom: Atom<T | undefined> = atom((get) => get(dataAtom)[id])
    atomsById.set(id, entityAtom)
    return entityAtom
  }
}

export function getMaxUpdatedAt<T extends { updatedAt: number }>(items: T[]): number {
  if (items.length === 0) {
    return 0;
  }

  return Math.max(...items.map(item => item.updatedAt))
}
