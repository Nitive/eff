import { run } from '@eff/core/run'
import { makeDomDriver } from '@eff/dom/client'
import * as Snabbdom from '@eff/dom/h'

function App() {
  return [<div>div</div>, <button>button</button>]
}

run(<div><App /></div>, {
  DOM: makeDomDriver('#app'),
})
