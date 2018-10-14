import { run } from '@eff/core/run'
import { makeDomDriver, DOMSource } from '@eff/dom/client'
import * as Snabbdom from '@eff/dom/h'
import xs from 'xstream'

interface Sources {
  DOM: DOMSource,
}

function App(_props: {}, sources: Sources) {
  const currentTime$ = xs
    .periodic(1000)
    .startWith(0)
    .take(100)
    .map(() => new Date())

  const readableCurrentTime$ = currentTime$
    .map(x => <div>Time is {x.toLocaleTimeString()}</div>)

  const buttonRef = sources.DOM.createRef()

  const buttonClick$ = buttonRef
    .events('click')
    .fold(acc => acc + 1, 0)

  return (
    <div style={'margin: 20px' as any}>
      <div style={'margin-bottom: 10px; padding: 5px; border: 1px solid black; width: 100px' as any}>
        <div>Clicks: {buttonClick$}</div>
        <button ref={buttonRef}>inc</button>
      </div>
      {readableCurrentTime$}
    </div>
  )
}

run(<App />, {
  DOM: makeDomDriver('#app'),
})
