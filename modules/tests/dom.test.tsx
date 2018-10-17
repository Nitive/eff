import EffDOM, { DOMSource } from 'eff-dom'
import xs from 'xstream'
import { render } from './test-utils'

interface Sources {
  DOM: DOMSource
}

describe('jsx', () => {
  it('should render plain div', async () => {
    expect(render(<div />)).toBe('<div></div>')
  })

  it('should render plain span', async () => {
    expect(render(<span />)).toBe('<span></span>')
  })

  it('should render div with text child', async () => {
    expect(render(<div>text</div>)).toBe('<div>text</div>')
  })

  it('should render div with span child', async () => {
    expect(render(<div><span /></div>)).toBe('<div><span></span></div>')
  })

  it('should render div with two span children', async () => {
    expect(render(<div><span /><span /></div>)).toBe('<div><span></span><span></span></div>')
  })

  it('should render div with text and span children', async () => {
    expect(render(<div>text<span /></div>)).toBe('<div>text<span></span></div>')
  })

  it('should render div with text and span children. And span also has text child', async () => {
    expect(render(<div>text<span>span text</span></div>)).toBe('<div>text<span>span text</span></div>')
  })

  it('should render div with array child with one text element', async () => {
    expect(render(<div>{['text1']}</div>)).toBe('<div>text1</div>')
  })

  it('should render div with array child with two text elements', async () => {
    expect(render(<div>{['text1', 'text2']}</div>)).toBe('<div>text1text2</div>')
  })

  it('should render div with array child with a text element and span element', async () => {
    expect(render(<div>{['text1', <span />]}</div>)).toBe('<div>text1<span></span></div>')
  })

  it('should render div with array child with a text element and span element', async () => {
    expect(render(<div>{['text1', <span>span text</span>]}</div>)).toBe('<div>text1<span>span text</span></div>')
  })

  it('should render div with stream of text child', async () => {
    expect(render(<div>{xs.of('text')}</div>)).toBe('<div>text</div>')
  })

  it('should render div with stream of span child', async () => {
    expect(render(<div>{xs.of(<span />)}</div>)).toBe('<div><span></span></div>')
  })

  it('should render div with stream of array child', async () => {
    expect(render(<div>{xs.of([<span />, 'text'])}</div>)).toBe('<div><span></span>text</div>')
  })

  it('should render div with undefined child', async () => {
    expect(render(<div>{undefined}</div>)).toBe('<div></div>')
  })

  it('should render div with null child', async () => {
    expect(render(<div>{null}</div>)).toBe('<div></div>')
  })

  it('should render div with false child', async () => {
    expect(render(<div>{false}</div>)).toBe('<div></div>')
  })

  it('should render div with true child', async () => {
    expect(render(<div>{true}</div>)).toBe('<div>true</div>')
  })

  it('should render div with number child', async () => {
    expect(render(<div>{0}</div>)).toBe('<div>0</div>')
    expect(render(<div>{1}</div>)).toBe('<div>1</div>')
  })

  it('should render simple component without props', async () => {
    function Button() {
      return <button>text</button>
    }

    expect(render(<Button />)).toBe('<button>text</button>')
  })

  it('should render simple component with props', async () => {
    function Button(props: { type: 'button' | 'submit' }) {
      return <button type={props.type}>text</button>
    }

    expect(render(<Button type="button" />)).toBe('<button type="button">text</button>')
  })

  it('should render simple component with child', async () => {
    function Button(props: { children?: any }) {
      return <button>{props.children}</button>
    }

    expect(render(<Button>text</Button>)).toBe('<button>text</button>')
  })

  it('should render component inside div', async () => {
    function Button(props: { children?: any }) {
      return <button>{props.children}</button>
    }

    expect(render(<div><Button /></div>)).toBe('<div><button></button></div>')
  })

  it('should render simple component with children', async () => {
    function Button(props: { children?: any }) {
      return <button>{props.children}</button>
    }

    expect(render(<Button><span /><span /></Button>)).toBe('<button><span></span><span></span></button>')
  })

  it('should render simple component with streams children', async () => {
    function Button(props: { children?: any }) {
      return <button>{props.children}</button>
    }

    expect(render(<Button>{xs.of(<span />)}{xs.of(1)}</Button>)).toBe('<button><span></span>1</button>')
  })

  it('should render simple component with component child', async () => {
    function Button(props: { children?: any }) {
      return <button>{props.children}</button>
    }

    expect(render(<Button><Button/></Button>)).toBe('<button><button></button></button>')
  })

  it('should render simple component with stream of component child', async () => {
    function Button(props: { children?: any }) {
      return <button>{props.children}</button>
    }

    expect(render(<Button>{xs.of(<Button/>)}</Button>)).toBe('<button><button></button></button>')
  })

  it('should render div with stream of span child', async () => {
    expect(render(<div>{xs.of(<span />)}</div>)).toBe('<div><span></span></div>')
  })

  it('should be possible to get sources inside component', async () => {
    const checkSources = jest.fn()
    function Button(_props: {}, sources: Sources) {
      checkSources(sources)
      expect(sources.DOM).not.toBeFalsy()
      return <button />
    }

    expect(render(<Button />)).toBe('<button></button>')
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

    expect(render(x)).toBe('<div><button></button></div>')
    expect(checkSources).toHaveBeenCalledTimes(1)
  })

  it('should support returning array in component', async () => {
    function Buttons() {
      return [<button>1</button>, <button>2</button>]
    }

    expect(render(<div><Buttons /></div>)).toBe('<div><button>1</button><button>2</button></div>')
  })
})
