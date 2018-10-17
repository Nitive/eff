import EffDOM from 'eff-dom'
import { render } from './test-utils'

describe('refs', () => {
  it('should support style attribute as object', async () => {
    expect(render(<div style={{ margin: '10px' }} />)).toBe('<div style="margin: 10px;"></div>')
  })
})
