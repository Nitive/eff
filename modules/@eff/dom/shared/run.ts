import { init } from 'snabbdom'
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

function attachRefs(vnode: VNode, refs: { [refId: string]: Ref<Node> }): VNode {
  const { data } = vnode
  const ref = vnode.data && vnode.data.props && vnode.data.props.ref

  if (!ref || !ref.id || !data) {
    return vnode
  }

  return {
    ...vnode,
    data: {
      ...data,
      hook: {
        ...data.hook,
        insert: vn => {
          refs[ref.id].elm$.shamefullySendNext(vn.elm || undefined)
          if (data.hook && data.hook.insert) {
            data.hook.insert(vn)
          }
        },
        update: (old, vn) => {
          refs[ref.id].elm$.shamefullySendNext(vn.elm || undefined)
          if (data.hook && data.hook.update) {
            data.hook.update(old, vn)
          }
        },
        destroy: vn => {
          refs[ref.id].elm$.shamefullySendNext(undefined)
          if (data.hook && data.hook.destroy) {
            data.hook.destroy(vn)
          }
        },
      },
    },
  }
}

function addStyle(vnode: VNode): VNode {
  const props = vnode.data && vnode.data.props

  if (!props) {
    return vnode
  }

  const { style, ...rest } = props

  return {
    ...vnode,
    data: {
      ...vnode.data,
      props: rest,
      style,
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
      ...addStyle(attachRefs(vnode, refs)),
      children,
    }
  }

  const vnodeWithRefs$ = vnode$.map(prepareVNodes)

  const withNode = (vnodeWithRefs$ as Stream<VNode | HTMLElement>).startWith(node)

  const patch = init([
    require('snabbdom/modules/class').default,
    require('snabbdom/modules/attributes').default,
    require('snabbdom/modules/props').default,
    require('snabbdom/modules/style').default,
    require('snabbdom/modules/eventlisteners').default,
    require('snabbdom/modules/dataset').default,
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
