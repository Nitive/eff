import { run } from 'eff-core'
import EffDOM from 'eff-dom'
import { makeDOMDriver } from 'eff-dom/client'
import { invoke, makeFnDriver } from 'eff-fn'
import xs from 'xstream'

async function effs(app: any): Promise<{ DOM: string }> {
  document.body.innerHTML = '<div id="app"></div>'
  run(app, {
    DOM: makeDOMDriver('#app'),
    fn: makeFnDriver(),
  })

  return {
    DOM: document.body.innerHTML,
  }
}

describe('fn effect', () => {
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

  it('should render div with stream of effect child', async () => {
    const fn = jest.fn()
    const result = await effs(<div>{xs.of(invoke('TEST', fn))}</div>)
    expect(result.DOM).toBe('<div></div>')
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
