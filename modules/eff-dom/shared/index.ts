import { VNode } from 'snabbdom/vnode'
import xs, { Stream } from 'xstream'
import { select, Visitors } from './select'

export { Ref } from './ref'
export { select } from './select'
export { DOMSource } from './source'

export function selectDOMEff(effects: any, sources: any): Stream<VNode> {
  const visitors: Partial<Visitors> = {
    string(node: string) {
      return xs.of(node)
    },
    number(node: number) {
      return xs.of(String(node))
    },
    boolean(node: boolean) {
      return xs.of(String(node || ''))
    },
    vnode(node: VNode, visit, sources) {
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

  const vnode$ = select<VNode>(visitors, effects, sources)

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
