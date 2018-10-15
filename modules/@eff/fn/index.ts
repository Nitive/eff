import { Driver, Effect } from '@eff/core/run'
import xs, { Stream } from 'xstream'
import { select } from '@eff/dom/shared'

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
  return { effectType: fnEffectType, sink$: xs.of({ code, fn }) }
}
