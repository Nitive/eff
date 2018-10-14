import * as Snabbdom from '@eff/dom/h'
import { DOMSource } from '@eff/dom/shared'
import { run } from '@eff/core/run'
import { makeDomDriver } from '@eff/dom/client'

describe('dom', () => {
  it('should support events on refs', async () => {
    function App(_props: any, sources: { DOM: DOMSource }) {
      const buttonRef = sources.DOM.createRef()
      const clicksCount$  = buttonRef.events('click').fold(x => x + 1, 0)

      return <button ref={buttonRef}>{clicksCount$}</button>
    }

    document.body.innerHTML = '<div id="app">Loading...</div>'

    run(<App />, {
      DOM: makeDomDriver('#app'),
    })

    expect(document.body.innerHTML).toBe('<button>0</button>')
    document.querySelector('button')!.click()
    expect(document.body.innerHTML).toBe('<button>1</button>')
  })
})
