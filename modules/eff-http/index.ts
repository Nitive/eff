import { createEffect, Driver, Effect } from 'eff-core'
import { select } from 'eff-dom'
import xs, { Stream } from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats'
import { HTTPRequest, HTTPEffect, HTTPSource, Response } from './source'

export * from './source'

const httpEffectType = Symbol('http effect type')

interface Options {
  fetch: GlobalFetch['fetch']
}

export function makeHTTPDriver(options: Options): Driver<Stream<HTTPEffect>, HTTPSource> {
  return {
    run(sink: Stream<HTTPEffect>): HTTPSource {
      sink
        .addListener({
          next(eff: HTTPEffect) {
            eff.response$.shamefullySendNext({ status: 'pending' })

            options.fetch(eff.input, eff.init)
              .then(res => res.json())
              .then(res => {
                eff.response$.shamefullySendNext({ status: 'success', data: res })
              })
              .catch(error => {
                eff.response$.shamefullySendNext({ status: 'error', error })
              })
          },
        })

      return {
        request<Data, Error>(input: RequestInfo, init?: RequestInit): HTTPRequest<Data, Error> {
          const response$ = xs.create<Response<Data, Error>>()

          return {
            response$,
            makeRequest(): HTTPEffect {
              return createEffect<HTTPEffect>(httpEffectType, { requestId: Symbol(), response$, input, init })
            },
          }
        },
      }
    },
    select(effects, sources): Stream<HTTPEffect> {
      const visitors = {
        effect(node: Effect) {
          if (node.effectType === httpEffectType) {
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
        .map(eff => eff.sink)
        .compose(dropRepeats((a, b) => a.requestId === b.requestId))
    },
  }
}
