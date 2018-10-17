import { init } from 'snabbdom'
import { Module } from 'snabbdom/modules/module'
import { toVNode } from 'snabbdom/tovnode'
import { VNode } from 'snabbdom/vnode'
import xs, { Stream } from 'xstream'
import fromEvent from 'xstream/extra/fromEvent'
import pairwise from 'xstream/extra/pairwise'
import { Ref } from './ref'

function createRef(id: string, elm$: Stream<Node | undefined>): Ref<Node> {
  return {
    id,
    elm$,
    events(event: string) {
      return elm$
        .filter<Node>((x): x is Node => !!x)
        .map(elm => fromEvent(elm, event))
        .flatten()
    },
  }
}

function createRefModule(refs: { [refId: string]: Ref<Node> }): Partial<Module> {
  const run = (vn: VNode, elm: Node | undefined) => {
    const refId = vn.data && vn.data.props && vn.data.props.ref && vn.data.props.ref.id
    if (!refId) return
    refs[refId].elm$.shamefullySendNext(elm)
  }

  return {
    create(_old, vn) {
      run(vn, vn.elm || undefined)
    },
    update: (_old, vn) => {
      run(vn, vn.elm || undefined)
    },
    destroy: vn => {
      run(vn, undefined)
    },
  }
}

function splitPropsAndAttrs(vnode: VNode): VNode {
  const props = vnode.data && vnode.data.props

  if (!props) {
    return vnode
  }

  const { style, className, ref, class: classProp, key, ...attrs } = props

  return {
    ...vnode,
    data: {
      ...vnode.data,
      props: { className, ref },
      class: classProp,
      attrs,
      style,
      key,
    },
  }
}

export function runDomEffect(vnode$: Stream<VNode>, node: HTMLElement) {
  const refs: { [refId: string]: Ref<Node> } = {}

  function prepareVNodes(vnode: VNode | string): VNode {
    if (typeof vnode === 'string') {
      return { text: vnode } as any
    }

    const children = (vnode.children || []).map(prepareVNodes)

    return {
      ...splitPropsAndAttrs(vnode),
      children,
    }
  }

  const vnodeWithRefs$ = vnode$.map(prepareVNodes)

  const withNode = vnodeWithRefs$.startWith(toVNode(node))

  const patch = init([
    createRefModule(refs),
    require('snabbdom/modules/class').default,
    require('snabbdom/modules/attributes').default,
    require('snabbdom/modules/props').default,
    require('snabbdom/modules/style').default,
  ])

  withNode
    .compose(pairwise)
    .addListener({
      next([prev, next]: [VNode | HTMLElement, VNode]) {
        patch(prev, next)
      },
      error(err) {
        throw new Error(err)
      },
    })

  let refsCounter = 0
  return {
    createRef<T extends Node>(): Ref<T> {
      refsCounter += 1
      const refId = String(refsCounter)
      refs[refId] = createRef(refId, xs.create<T | undefined>().remember())
      return refs[refId] as Ref<T>
    },
  }
}
