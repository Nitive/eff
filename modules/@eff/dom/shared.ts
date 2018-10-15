import { VNode } from 'snabbdom/vnode'
import xs, { Stream } from 'xstream'

function selectDOMStream(effects: any, sources: any): Stream<VNode | string | Array<VNode | string> | undefined> {
  if (typeof effects === 'function') {
    return selectDOMStream(effects(sources), sources)
  }

  if (effects === true) {
    return xs.of('true')
  }

  if (effects instanceof Stream) {
    return (effects as Stream<VNode>)
      .map(effects => selectDOMStream(effects, sources))
      .flatten()
  }

  if (Array.isArray(effects)) {
    return xs
      .combine(...(effects as Array<VNode>).map(x => selectDOMStream(x, sources)))
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

  if (typeof effects === 'number') {
    return xs.of(String(effects))
  }

  if (effects && (effects.sel || effects.text !== undefined)) {
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

  return xs.of(undefined)
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
