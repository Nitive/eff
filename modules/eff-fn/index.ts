import { createEffect, Driver, Effect } from 'eff-core'
import { select } from 'eff-dom'
import xs, { Stream } from 'xstream'

type FnSink = { code: string, fn: () => void }

const fnEffectType = Symbol('fn effect type')

export function makeFnDriver(): Driver<Stream<FnSink>, void> {
  return {
    run(sink: Stream<FnSink>) {
      sink.addListener({
        next(eff) {
          eff.fn()
        },
      })
    },
    select(effects, sources) {
      const visitors = {
        effect(node: Effect) {
          if (node.effectType === fnEffectType) {
            return xs.of(node)
          }

          return xs.of(undefined)
        },
      }
      return select<Effect>(visitors, effects, sources)
        .map(eff => {
          return Array.isArray(eff) ? xs.from(eff) : xs.of(eff)
        })
        .flatten()
        .map(eff => eff.sink$)
        .flatten()
        .filter(Boolean)
    },
  }
}

export function invoke(code: string, fn: () => void) {
  return createEffect(fnEffectType, xs.of({ code, fn }))
}
