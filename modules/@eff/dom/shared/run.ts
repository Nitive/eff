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

export function runDomEffect(vnode$: Stream<VNode>, node: HTMLElement) {
  const refs: { [refId: string]: Ref<Node> } = {}

  function prepareVNodes(vnode: VNode | string): VNode {
    if (typeof vnode === 'string') {
      return { text: vnode } as any
    }

    const children = (vnode.children || []).map(prepareVNodes)

    if (vnode.data) {
      const { props, ...data } = vnode.data
      const refId = props && props.ref && props.ref.id

      if (refId) {
        return {
          ...vnode,
          children,
          data: {
            ...data,
            // TODO: кажется ещё нужно передавать пропсы
            hook: {
              ...data.hook,
              insert: vn => {
                refs[refId].elm$.shamefullySendNext(vn.elm || undefined)
                if (data.hook && data.hook.insert) {
                  data.hook.insert(vn)
                }
              },
              update: (old, vn) => {
                refs[refId].elm$.shamefullySendNext(vn.elm || undefined)
                if (data.hook && data.hook.update) {
                  data.hook.update(old, vn)
                }
              },
              destroy: vn => {
                refs[refId].elm$.shamefullySendNext(undefined)
                if (data.hook && data.hook.destroy) {
                  data.hook.destroy(vn)
                }
              },
            },
          },
        }
      }
    }

    return { ...vnode, children }
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
