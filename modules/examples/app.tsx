import { run } from '@eff/core/run'
import { makeDomDriver } from '@eff/dom/client'
import * as Snabbdom from '@eff/dom/h'
import xs from 'xstream'

function App() {
  const counter = xs
    .periodic(1000)
    .take(100)
    .map(x => <div>Count: {x + 1}</div>)

  return [
    <div>div</div>,
    <button>button</button>,
    counter,
  ]
}

run(<div><App /></div>, {
  DOM: makeDomDriver('#app'),
})
