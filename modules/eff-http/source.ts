import { Effect } from 'eff-core'
import { Stream } from 'xstream'

export interface HTTPEffect extends Effect {
  requestId: Symbol,
  response$: Stream<Response<any>>,
  input: RequestInfo,
  init?: RequestInit,
}

export type Response<Data, Error = any>
  = { status: 'pending' }
  | { status: 'success', data: Data }
  | { status: 'error', error: Error }

export interface HTTPRequest<Data, Error = any> {
  makeRequest(): HTTPEffect,
  response$: Stream<Response<Data, Error>>
}

export interface HTTPSource {
  request<Data, Error = any>(input: RequestInfo, init?: RequestInit): HTTPRequest<Data, Error>
}
