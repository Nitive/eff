import { Driver } from '@eff/core/run'
import xs, { Stream } from 'xstream'

type FnSink = { code: string, fn: () => void }

export function makeFnDriver(): Driver<Stream<FnSink>, void> {
  return {
    run(sink: Stream<FnSink>) {
      sink.addListener({
        next({ fn }) {
          fn()
        },
      })
    },
    select(effects) {
      // TODO: select in all tree
      return effects.children[0].sink$.filter(Boolean)
    },
  }
}

export function invoke(code: string, fn: () => void) {
  return { effectType: 'fn', sink$: xs.of({ code, fn }) }
}
