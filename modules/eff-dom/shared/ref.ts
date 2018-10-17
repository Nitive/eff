import { Stream } from 'xstream'

export interface Ref<T> {
  id: string,
  elm$: Stream<T | undefined>,
  events(event: string): Stream<Event>,
}
