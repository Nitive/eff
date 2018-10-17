import EffDOM from '@eff/dom'
import { render } from './test-utils'

describe('attrs', () => {
  it('should render role attribute', () => {
    expect(render(<span role="button" />)).toBe('<span role="button"></span>')
  })

  it('should render data attribute', () => {
    expect(render(<span data-action="reset" />)).toBe('<span data-action="reset"></span>')
  })

  it('should render className property', () => {
    expect(render(<div className="container" />)).toBe('<div class="container"></div>')
  })

  it('should render class property', () => {
    expect(render(<div class={{ container: true }} />)).toBe('<div class="container"></div>')
  })

  it('should prefer className if both className and class is used', () => {
    expect(render(<div className="container" class={{ wide: true }} />)).toBe('<div class="container"></div>')
    expect(render(<div class={{ wide: true }} className="container"  />)).toBe('<div class="container"></div>')
  })

  it('should not render key property', () => {
    expect(render(<div key="div" />)).toBe('<div></div>')
  })
})
