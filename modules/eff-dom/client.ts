import { Driver } from 'eff-core'
import { VNode } from 'snabbdom/vnode'
import { Stream } from 'xstream'
import { DOMSource, selectDOMEff } from './shared'
import { runDomEffect } from './shared/run'

export function makeDomDriver(selector: string): Driver<Stream<VNode>, DOMSource> {
  const node = document.querySelector(selector)
  if (!(node instanceof HTMLElement)) {
    throw new Error(`Cannot find node with selector ${selector}`)
  }

  return {
    run(sink: Stream<VNode>) {
      return runDomEffect(sink, node)
    },
    select(effects, sources: any) {
      return selectDOMEff(effects, sources)
    },
  }
}
