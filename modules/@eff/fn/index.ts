import { createEffect, Effect } from '@eff/core/effect'
import { Driver } from '@eff/core/run'
import { select } from '@eff/dom/shared'
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
      return select(visitors, effects, sources)
        .map(x => {
          return Array.isArray(x) ? xs.from(x) : xs.of(x)
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
