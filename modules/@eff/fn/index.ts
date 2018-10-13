import { Driver } from '@eff/core/run'
import xs, { Stream } from 'xstream'

export interface FnSource {
  invoke(code: string, fn: () => void): void,
}

type FnSink = { code: string, fn: () => void }

export function makeFnDriver(): Driver<Stream<FnSink>, FnSource> {
  return {
    run(sink: Stream<FnSink>) {
      sink.addListener({
        next({ fn }) {
          fn()
        },
      })

      return {
        invoke(code, fn) {
          return { effectType: 'fn', sink$: xs.of({ code, fn }) }
        },
      }
    },
    select(effects) {
      return effects.fn.filter(Boolean)
    },
  }
}
