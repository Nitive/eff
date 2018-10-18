const effectSymbol = Symbol('@eff effect')
export interface Effect {
  'private_@eff_type': Symbol,
  effectType: Symbol,
  sink: any
}

export function isEffect(eff: any): eff is Effect {
  return eff && eff['private_@eff_type'] === effectSymbol
}

export function createEffect<T extends Effect = Effect>(effectType: Symbol, sink: any): T {
  return {
    'private_@eff_type': effectSymbol,
    effectType,
    sink,
  } as any
}
