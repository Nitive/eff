import { h } from 'snabbdom/h'
import { VNode } from 'snabbdom/vnode'
import { Stream } from 'xstream'
import { Component, Element } from './types'

export function createElement<Props, Sources extends { DOM: any }, Sinks extends { DOM: Stream<VNode> }>(
  component: Component<Props, Sources, Sinks> | string,
  _props: Props,
  ...children: any[]
): Element<Sources, Sinks> {
  return (sources: Sources) => {
    const props = _props || {}

    if (typeof component === 'string') {
      return h(component, { props }, children)
    }

    return component({ ...props, children } as any, sources) as any
  }
}
