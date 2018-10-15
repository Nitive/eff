import { run } from '@eff/core/run'
import { makeDomDriver, DOMSource } from '@eff/dom/client'
import * as Snabbdom from '@eff/dom/h'
import xs, { Stream } from 'xstream'
import { makeFnDriver, invoke } from '../fn'

export function toPromise<T>(stream: Stream<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    stream
      .last()
      .addListener({
        next(value: T) {
          resolve(value)
        },
        error: reject,
      })
  })
}

interface Sources {
  DOM: DOMSource
}

async function dom(app: any): Promise<string> {
  document.body.innerHTML = '<div id="app">Loading...</div>'
  run(app, {
    DOM: makeDomDriver('#app'),
  })

  return document.body.innerHTML
}

async function effs(app: any): Promise<{ DOM: string }> {
  document.body.innerHTML = '<div id="app"></div>'
  run(app, {
    DOM: makeDomDriver('#app'),
    fn: makeFnDriver(),
  })

  return {
    DOM: document.body.innerHTML,
  }
}

describe('jsx', () => {
  it('should render plain div', async () => {
    expect(await dom(<div />)).toBe('<div></div>')
  })

  it('should render plain span', async () => {
    expect(await dom(<span />)).toBe('<span></span>')
  })

  it('should render div with text child', async () => {
    expect(await dom(<div>text</div>)).toBe('<div>text</div>')
  })

  it('should render div with span child', async () => {
    expect(await dom(<div><span /></div>)).toBe('<div><span></span></div>')
  })

  it('should render div with two span children', async () => {
    expect(await dom(<div><span /><span /></div>)).toBe('<div><span></span><span></span></div>')
  })

  it('should render div with text and span children', async () => {
    expect(await dom(<div>text<span /></div>)).toBe('<div>text<span></span></div>')
  })

  it('should render div with text and span children. And span also has text child', async () => {
    expect(await dom(<div>text<span>span text</span></div>)).toBe('<div>text<span>span text</span></div>')
  })

  it('should render div with array child with one text element', async () => {
    expect(await dom(<div>{['text1']}</div>)).toBe('<div>text1</div>')
  })

  it('should render div with array child with two text elements', async () => {
    expect(await dom(<div>{['text1', 'text2']}</div>)).toBe('<div>text1text2</div>')
  })

  it('should render div with array child with a text element and span element', async () => {
    expect(await dom(<div>{['text1', <span />]}</div>)).toBe('<div>text1<span></span></div>')
  })

  it('should render div with array child with a text element and span element', async () => {
    expect(await dom(<div>{['text1', <span>span text</span>]}</div>)).toBe('<div>text1<span>span text</span></div>')
  })

  it('should render div with stream of text child', async () => {
    expect(await dom(<div>{xs.of('text')}</div>)).toBe('<div>text</div>')
  })

  it('should render div with stream of span child', async () => {
    expect(await dom(<div>{xs.of(<span />)}</div>)).toBe('<div><span></span></div>')
  })

  it('should render div with stream of array child', async () => {
    expect(await dom(<div>{xs.of([<span />, 'text'])}</div>)).toBe('<div><span></span>text</div>')
  })

  it('should render div with undefined child', async () => {
    expect(await dom(<div>{undefined}</div>)).toBe('<div></div>')
  })

  it('should render div with null child', async () => {
    expect(await dom(<div>{null}</div>)).toBe('<div></div>')
  })

  it('should render div with false child', async () => {
    expect(await dom(<div>{false}</div>)).toBe('<div></div>')
  })

  it('should render div with true child', async () => {
    expect(await dom(<div>{true}</div>)).toBe('<div>true</div>')
  })

  it('should render div with effect child', async () => {
    const fn = jest.fn()
    const result = await effs(<div>{invoke('TEST_FN', fn)}</div>)
    expect(result.DOM).toBe('<div></div>')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should render div with effect children', async () => {
    const fn = jest.fn()
    const fn2 = jest.fn()
    const result = await effs(
      <div>
        {invoke('TEST', fn)}
        {invoke('TEST', fn2)}
      </div>,
    )
    expect(result.DOM).toBe('<div></div>')
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)
  })

  it('should render div with number child', async () => {
    expect(await dom(<div>{0}</div>)).toBe('<div>0</div>')
    expect(await dom(<div>{1}</div>)).toBe('<div>1</div>')
  })

  it('should render simple component without props', async () => {
    function Button() {
      return <button>text</button>
    }

    expect(await dom(<Button />)).toBe('<button>text</button>')
  })

  it('should render simple component with props', async () => {
    function Button(props: { type: 'button' | 'submit' }) {
      return <button type={props.type}>text</button>
    }

    expect(await dom(<Button type="button" />)).toBe('<button type="button">text</button>')
  })

  it('should render simple component with child', async () => {
    function Button(props: { children?: any }) {
      return <button>{props.children}</button>
    }

    expect(await dom(<Button>text</Button>)).toBe('<button>text</button>')
  })

  it('should render component inside div', async () => {
    function Button(props: { children?: any }) {
      return <button>{props.children}</button>
    }

    expect(await dom(<div><Button /></div>)).toBe('<div><button></button></div>')
  })

  it('should render simple component with children', async () => {
    function Button(props: { children?: any }) {
      return <button>{props.children}</button>
    }

    expect(await dom(<Button><span /><span /></Button>)).toBe('<button><span></span><span></span></button>')
  })

  it('should render simple component with streams children', async () => {
    function Button(props: { children?: any }) {
      return <button>{props.children}</button>
    }

    expect(await dom(<Button>{xs.of(<span />)}{xs.of(1)}</Button>)).toBe('<button><span></span>1</button>')
  })

  it('should render simple component with component child', async () => {
    function Button(props: { children?: any }) {
      return <button>{props.children}</button>
    }

    expect(await dom(<Button><Button/></Button>)).toBe('<button><button></button></button>')
  })

  it('should render simple component with stream of component child', async () => {
    function Button(props: { children?: any }) {
      return <button>{props.children}</button>
    }

    expect(await dom(<Button>{xs.of(<Button/>)}</Button>)).toBe('<button><button></button></button>')
  })

  it('should render div with stream of span child', async () => {
    expect(await dom(<div>{xs.of(<span />)}</div>)).toBe('<div><span></span></div>')
  })

  it('should render div with stream of effect child', async () => {
    const fn = jest.fn()
    const result = await effs(<div>{xs.of(invoke('TEST', fn))}</div>)
    expect(result.DOM).toBe('<div></div>')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should be possible to get sources inside component', async () => {
    const checkSources = jest.fn()
    function Button(_props: {}, sources: Sources) {
      checkSources(sources)
      expect(sources.DOM).not.toBeFalsy()
      return <button />
    }

    expect(await dom(<Button />)).toBe('<button></button>')
    expect(checkSources).toHaveBeenCalledTimes(1)
  })

  it('should be possible to get sources inside component which is inside div', async () => {
    const checkSources = jest.fn()
    function Button(_props: {}, sources: Sources) {
      checkSources(sources)
      expect(sources.DOM).not.toBeFalsy()
      return <button />
    }

    const x = <div><Button /></div>

    expect(await dom(x)).toBe('<div><button></button></div>')
    expect(checkSources).toHaveBeenCalledTimes(1)
  })

  it('should support returning array in component', async () => {
    function Buttons() {
      return [<button>1</button>, <button>2</button>]
    }

    expect(await dom(<div><Buttons /></div>)).toBe('<div><button>1</button><button>2</button></div>')
  })
})
