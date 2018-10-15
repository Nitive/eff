import { VNodeData } from 'snabbdom/vnode'
import { createElement as _createElement } from './h';

export = EffPragma

declare namespace EffPragma {
  export type createElement = typeof _createElement
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: VNodeData
    }
  }
}
