import { VNode } from 'snabbdom/vnode'
import xs, { Stream } from 'xstream'
import { isEffect } from '@eff/core/run'

function selectDOMStream(effects: any, sources: any): Stream<VNode | string | Array<VNode | string> | undefined> {
  if (effects instanceof Stream) {
    return (effects as Stream<VNode>)
      .map(effects => selectDOMStream(effects, sources))
      .flatten()
  }

  if (Array.isArray(effects)) {
    return xs
      .combine(...(effects as Array<VNode>).map(selectDOMStream))
      .map((children: Array<VNode | VNode[] | string | string[] | undefined>) => {
        return children
          .reduce((acc, child) => {
            return child !== undefined
              ? acc.concat(child)
              : acc
          }, [] as Array<VNode | string>)
      })
  }

  if (typeof effects === 'string') {
    return xs.of(effects)
  }

  if (typeof effects === 'undefined') {
    return xs.of(undefined)
  }

  if (isEffect(effects)) {
    return xs.of(undefined)
  }

  if (effects.DOM) {
    return selectDOMStream(effects.DOM, sources)
  }

  const vnode = effects

  if (vnode.children) {
    const children$ = selectDOMStream(vnode.children, sources) as Stream<Array<VNode | string>>

    return children$
      .map((children): VNode => {
        return {
          ...vnode,
          children,
        }
      })
  }

  return xs.of(vnode)
}

export function selectDOMEff(effects: any, sources: any): Stream<VNode> {
  const vnode$ = selectDOMStream(effects, sources)

  return vnode$
    .map(vnode => {
      if (typeof vnode === 'undefined') {
        throw new Error('Root element can not be undefined')
      }

      if (typeof vnode === 'string') {
        throw new Error('Root element can not be a string')
      }

      if (Array.isArray(vnode)) {
        throw new Error('Root element can not be an array')
      }

      return vnode
    })
}

export interface Ref<T> {
  id: string,
  elm$: Stream<T | undefined>,
  events(event: string): Stream<Event>,
}

export interface DOMSource {
  createRef<T extends Node>(): Ref<T>
}
