import { run } from '@eff/core/run'
import { makeDomDriver, DOMSource } from '@eff/dom/client'
import * as Snabbdom from '@eff/dom/h'
import xs from 'xstream'
import { makeFnDriver, FnSource } from '../@eff/fn'

interface Sources {
  DOM: DOMSource,
  fn: FnSource,
}

function App(_props: {}, sources: Sources) {
  const counter = xs
    .periodic(1000)
    .startWith(-1)
    .take(100)
    .map(x => x + 2)
    .map(x => <div>Count: {x}</div>)

  const buttonRef = sources.DOM.createRef()

  const buttonClick$ = buttonRef
    .events('click')
    .fold(acc => acc + 1, 0)

  return [
    <div>Clicks: {buttonClick$}</div>,
    <button ref={buttonRef}>button</button>,
    sources.fn.invoke('LOG_START', () => console.log('start')),
    counter.map(() => sources.fn.invoke('LOG_TIMER', () => console.log('timer'))),
    counter,
  ]
}

run(<div><App /></div>, {
  DOM: makeDomDriver('#app'),
  fn: makeFnDriver(),
})
