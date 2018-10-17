import { isEffect } from 'eff-core'
import xs, { Stream } from 'xstream'
import { isVNode } from './vnode'

type Visitor = (node: any, visit: (effects: any, sources: any) => Stream<any>, sources: any) => Stream<any>

export interface Visitors {
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
  stream(node: Stream<any>, visit, sources) {
    return node
      .map(effects => visit(effects, sources))
      .flatten()
  },
  array(node: Array<any>, visit, sources) {
    return xs
      .combine(...node.map(x => visit(x, sources)))
      .map(nodes => {
        return nodes
          .reduce((acc, child) => {
            return child !== undefined
              ? acc.concat(child)
              : acc
          }, [])
      })
  },
  vnode(node, visit, sources) {
    return visit(node.children, sources)
  },
}

export function select<T>(visitors: Partial<Visitors>, effects: any, sources: any): Stream<T> {
  const visit = (effects: any, sources: any) => {
    return select<T>(visitors, effects, sources)
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
