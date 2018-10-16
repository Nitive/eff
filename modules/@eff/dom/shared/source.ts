import { Ref } from './ref'

export interface DOMSource {
  createRef<T extends Node>(): Ref<T>
}
