import { Stream } from 'xstream'

const effectSymbol = Symbol('@eff effect')
export interface Effect {
  'private_@eff_type': Symbol,
  effectType: Symbol,
  sink$: Stream<any>
}

export function isEffect(eff: any): eff is Effect {
  return eff && eff['private_@eff_type'] === effectSymbol
}

export function createEffect(effectType: Symbol, sink$: Stream<any>): Effect {
  return {
    'private_@eff_type': effectSymbol,
    effectType,
    sink$,
  }
}
