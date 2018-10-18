import { run } from 'eff-core'
import { makeDomDriver } from 'eff-dom/client'

export function render(effects: any): string {
  document.body.innerHTML = '<div id="app">Loading...</div>'
  run(effects, {
    DOM: makeDomDriver('#app'),
  })

  return document.body.innerHTML
}

export function createFakeFetch(response: any): GlobalFetch['fetch'] {
  return function fetch() {
    return Promise.resolve({
      json() {
        return Promise.resolve(response)
      },
    } as any)
  }
}

export function nextTick() {
  return new Promise(resolve => {
    setTimeout(resolve)
  })
}
