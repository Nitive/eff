import { run } from '@eff/core'
import EffDOM, { DOMSource } from '@eff/dom'
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

  it('should support refs on element with plain text inside', async () => {
    function App(_props: any, sources: { DOM: DOMSource }) {
      const buttonRef = sources.DOM.createRef()
      const clicksCount$  = buttonRef.events('click').fold(x => x + 1, 0)

      return (
        <div>
          <button ref={buttonRef}>text</button>
          {clicksCount$}
        </div>
      )
    }

    document.body.innerHTML = '<div id="app">Loading...</div>'

    run(<App />, {
      DOM: makeDomDriver('#app'),
    })

    expect(document.body.innerHTML).toBe('<div><button>text</button>0</div>')
    document.querySelector('button')!.click()
    expect(document.body.innerHTML).toBe('<div><button>text</button>1</div>')
  })
})
