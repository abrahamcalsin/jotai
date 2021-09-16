/* eslint-disable import/named */
import { produce } from 'immer'
import type { Draft } from 'immer'
import { atom } from 'jotai'
import type { PrimitiveAtom, WritableAtom } from 'jotai'
import { getWeakCacheItem, setWeakCacheItem } from '../utils/weakCache'

const withImmerCache = new WeakMap()

export function withImmer<Value>(
  anAtom: PrimitiveAtom<Value>
): WritableAtom<Value, Value | ((draft: Draft<Value>) => void), void>

export function withImmer<Value, Result extends void | Promise<void>>(
  anAtom: WritableAtom<Value, Value, Result>
): WritableAtom<Value, Value | ((draft: Draft<Value>) => void), Result>

export function withImmer<Value, Result extends void | Promise<void>>(
  anAtom: WritableAtom<Value, Value, Result>
) {
  const deps: object[] = [anAtom]
  const cachedAtom = getWeakCacheItem(withImmerCache, deps)
  if (cachedAtom) {
    return cachedAtom
  }
  const derivedAtom = atom(
    (get) => get(anAtom),
    (get, set, fn: Value | ((draft: Draft<Value>) => void)) =>
      set(
        anAtom,
        produce(
          get(anAtom),
          typeof fn === 'function'
            ? (fn as (draft: Draft<Value>) => void)
            : () => fn
        )
      )
  )
  setWeakCacheItem(withImmerCache, deps, derivedAtom)
  return derivedAtom
}
