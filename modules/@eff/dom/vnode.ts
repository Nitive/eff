import { VNode } from 'snabbdom/vnode'

export function isVNode(vnode: any): vnode is VNode {
  return vnode && (vnode.sel !== undefined || vnode.text !== undefined)
}
