import { isEffect } from '@eff/core/effect'
import { VNode } from 'snabbdom/vnode'
import xs, { Stream } from 'xstream'
import { isVNode } from './vnode'

type Visitor = (node: any, visit: (effects: any, sources: any) => Stream<any>, sources: any) => Stream<any>

interface Visitors {
  component: Visitor,
  stream: Visitor,
  array: Visitor,
  vnode: Visitor,
  string: Visitor,
  number: Visitor,
  boolean: Visitor,
  undefined: Visitor,
  null: Visitor,
  symbol: Visitor,
  effect: Visitor,
  unknown: Visitor,
}

function unknownNodeVisitor() {
  return xs.of(undefined)
}

export const standardVisitors: Partial<Visitors> = {
  component(node, visit, sources) {
    return visit(node(sources), sources)
  },
  stream(node, visit, sources) {
    return (node as Stream<any>)
      .map(effects => visit(effects, sources))
      .flatten()
  },
  array(node, visit, sources) {
    return xs
      .combine(...(node as Array<any>)
      .map(x => visit(x, sources)))
      .map((nodes: Array<any>) => {
        return nodes
          .reduce((acc, child) => {
            return child !== undefined
              ? acc.concat(child)
              : acc
          }, [] as Array<any>)
      })
  },
  vnode(node, visit, sources) {
    return visit(node.children, sources)
  },
}

export function select(visitors: Partial<Visitors>, effects: any, sources: any): Stream<any> {
  const visit = (effects: any, sources: any) => {
    return select(visitors, effects, sources)
  }

  const visitorName: keyof Visitors =
    typeof effects === 'function' && 'component'
    || effects instanceof Stream && 'stream'
    || Array.isArray(effects) && 'array'
    || isVNode(effects) && 'vnode'
    || typeof effects === 'string' && 'string'
    || typeof effects === 'number' && 'number'
    || typeof effects === 'boolean' && 'boolean'
    || effects === undefined && 'undefined'
    || effects === null && 'null'
    || typeof effects === 'symbol' && 'symbol'
    || isEffect(effects) && 'effect'
    || 'unknown'

  const visitor = visitors[visitorName] || standardVisitors[visitorName] || unknownNodeVisitor

  return visitor(effects, visit, sources)
}

export function selectDOMEff(effects: any, sources: any): Stream<VNode> {
  const visitors: Partial<Visitors> = {
    string(node) {
      return xs.of(node)
    },
    number(node) {
      return xs.of(String(node))
    },
    boolean(node) {
      return xs.of(String(node || ''))
    },
    vnode(node, visit, sources) {
      if (node.children) {
        const children$ = visit(node.children, sources) as Stream<Array<any>>

        return children$
          .map((children): VNode => {
            return { ...node, children }
          })
      }

      return xs.of(node)
    },
  }

  const vnode$ = select(visitors, effects, sources)

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
