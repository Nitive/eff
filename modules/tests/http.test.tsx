import { run } from 'eff-core'
import EffDOM, { DOMSource } from 'eff-dom'
import { makeDOMDriver } from 'eff-dom/client'
import { HTTPEffect, HTTPSource, makeHTTPDriver } from 'eff-http'
import { createFakeFetch, nextTick } from './test-utils'

interface Sources {
  DOM: DOMSource,
  HTTP: HTTPSource,
}

describe('http effect', () => {
  it('should allow to make http request', async () => {
    function App(_props: {}, sources: Sources) {
      const githubApiRequest = sources.HTTP.request<{ current_user_url: string }>('https://api.github.com/')

      const currentUserURL$ = githubApiRequest.response$
        .map(res => {
          if (res.status === 'pending') {
            return 'Loading...'
          }

          if (res.status === 'success') {
            return res.data.current_user_url
          }

          if (res.status === 'error') {
            return 'Error!'
          }

          return (res as never)
        })
        .startWith('Loading...')

      return (
        <div>
          Current user URL: {currentUserURL$}
          {githubApiRequest.makeRequest()}
        </div>
      )
    }

    document.body.innerHTML = '<div id="app">Loading...</div>'

    run(<App />, {
      DOM: makeDOMDriver('#app'),
      HTTP: makeHTTPDriver({
        fetch: createFakeFetch({ current_user_url: 'http://github.com/user' }),
      }),
    })

    expect(document.body.innerHTML).toBe('<div>Current user URL: Loading...</div>')
    await nextTick()
    expect(document.body.innerHTML).toBe('<div>Current user URL: http://github.com/user</div>')
  })

  it('should not make request until makeRequest() is returned', async () => {
    function App(_props: {}, sources: Sources) {
      const githubApiRequest = sources.HTTP.request<{ current_user_url: string }>('https://api.github.com/')

      const currentUserURL$ = githubApiRequest.response$
        .map(res => {
          if (res.status === 'success') {
            return res.data.current_user_url
          }

          if (res.status === 'pending') {
            return 'Loading...'
          }

          if (res.status === 'error') {
            return 'Error!'
          }

          return (res as never)
        })
        .startWith('Loading...')

      githubApiRequest.makeRequest()

      return (
        <div>
          Current user URL: {currentUserURL$}
        </div>
      )
    }

    document.body.innerHTML = '<div id="app">Loading...</div>'

    run(<App />, {
      DOM: makeDOMDriver('#app'),
      HTTP: makeHTTPDriver({
        fetch: createFakeFetch({ current_user_url: 'http://github.com/user' }),
      }),
    })

    expect(document.body.innerHTML).toBe('<div>Current user URL: Loading...</div>')
    await nextTick()
    expect(document.body.innerHTML).toBe('<div>Current user URL: Loading...</div>')
  })

  it('should make request when the button pressed', async () => {
    function App(_props: {}, sources: Sources) {
      const githubApiRequest = sources.HTTP.request<{ current_user_url: string }>('https://api.github.com/')

      const currentUserURL$ = githubApiRequest.response$
        .map(res => {
          if (res.status === 'success') {
            return res.data.current_user_url
          }

          if (res.status === 'pending') {
            return 'Loading...'
          }

          if (res.status === 'error') {
            return 'Error!'
          }

          return (res as never)
        })
        .startWith('Click to load')

      const buttonRef = sources.DOM.createRef()

      const updateURL$ = buttonRef.events('click')
        .map((): HTTPEffect | undefined => githubApiRequest.makeRequest())
        .startWith(undefined)

      return (
        <div>
          Current user URL: {currentUserURL$}
          {updateURL$}
          <button ref={buttonRef}>Get URL</button>
        </div>
      )
    }

    document.body.innerHTML = '<div id="app">Loading...</div>'

    run(<App />, {
      DOM: makeDOMDriver('#app'),
      HTTP: makeHTTPDriver({
        fetch: createFakeFetch({ current_user_url: 'http://github.com/user' }),
      }),
    })

    expect(document.body.innerHTML).toBe('<div>Current user URL: Click to load<button>Get URL</button></div>')
    document.querySelector('button')!.click()
    await Promise.resolve()
    expect(document.body.innerHTML).toBe('<div>Current user URL: Loading...<button>Get URL</button></div>')
    await nextTick()
    expect(document.body.innerHTML).toBe('<div>Current user URL: http://github.com/user<button>Get URL</button></div>')
  })

  it('should make request when the button pressed', async () => {
    function App(_props: {}, sources: Sources) {
      const githubApiRequest = sources.HTTP
        .request<{ current_user_url: string }, { errorCode: string }>('https://api.github.com/')

      const currentUserURL$ = githubApiRequest.response$
        .map(res => {
          if (res.status === 'success') {
            return res.data.current_user_url
          }

          if (res.status === 'pending') {
            return 'Loading...'
          }

          if (res.status === 'error') {
            return `Error ${res.error && res.error.errorCode}`
          }

          return (res as never)
        })
        .startWith('Loading...')

      return (
        <div>
          Current user URL: {currentUserURL$}
          {githubApiRequest.makeRequest()}
        </div>
      )
    }

    document.body.innerHTML = '<div id="app">Loading...</div>'

    run(<App />, {
      DOM: makeDOMDriver('#app'),
      HTTP: makeHTTPDriver({
        fetch: createFakeFetch(Promise.reject({ errorCode: 'UNEXPECTED_ERROR' })),
      }),
    })

    expect(document.body.innerHTML).toBe('<div>Current user URL: Loading...</div>')
    await nextTick()
    expect(document.body.innerHTML).toBe('<div>Current user URL: Error UNEXPECTED_ERROR</div>')
  })

  it('should not repeat request when dom is changed', async () => {
    function Counter(_props: {}, sources: Sources) {
      const buttonRef = sources.DOM.createRef()
      const clicksCount$  = buttonRef.events('click').fold(x => x + 1, 0)

      return <button ref={buttonRef}>{clicksCount$}</button>
    }

    function App(_props: {}, sources: Sources) {
      const githubApiRequest = sources.HTTP.request<any>('https://api.github.com/')

      const status$ = githubApiRequest.response$
        .map(res => res.status)
        .startWith('pending')

      return (
        <div>
          Status: {status$}
          <Counter />
          {githubApiRequest.makeRequest()}
        </div>
      )
    }

    document.body.innerHTML = '<div id="app">Loading...</div>'

    const fetch = jest.fn(createFakeFetch({ result: 'result' }))

    run(<App />, {
      DOM: makeDOMDriver('#app'),
      HTTP: makeHTTPDriver({ fetch }),
    })

    expect(document.body.innerHTML).toBe('<div>Status: pending<button>0</button></div>')

    await nextTick()
    expect(document.body.innerHTML).toBe('<div>Status: success<button>0</button></div>')

    document.querySelector('button')!.click()
    expect(document.body.innerHTML).toBe('<div>Status: success<button>1</button></div>')

    document.querySelector('button')!.click()
    expect(document.body.innerHTML).toBe('<div>Status: success<button>2</button></div>')

    expect(fetch).toBeCalledTimes(1)
  })

  it('should repeat request when parent is recreated', async () => {
    function App(_props: {}, sources: Sources) {
      const githubApiRequest = sources.HTTP.request('https://api.github.com/')

      const status$ = githubApiRequest.response$
        .map(res => res.status)
        .startWith('pending')

      const buttonRef = sources.DOM.createRef()
      const visible  = buttonRef
        .events('click')
        .fold(x => !x, true)

      return (
        <div>
          <button ref={buttonRef}>toggle</button>
          Status: {status$}
          {visible.map(visible => visible
            ? <div>visible{githubApiRequest.makeRequest()}</div>
            : <div>hidden</div>)}
        </div>
      )
    }

    document.body.innerHTML = '<div id="app">Loading...</div>'

    const fetch = jest.fn(createFakeFetch({ result: 'result' }))

    run(<App />, {
      DOM: makeDOMDriver('#app'),
      HTTP: makeHTTPDriver({ fetch }),
    })

    expect(document.body.innerHTML).toBe('<div><button>toggle</button>Status: pending<div>visible</div></div>')
    await nextTick()
    expect(document.body.innerHTML).toBe('<div><button>toggle</button>Status: success<div>visible</div></div>')

    document.querySelector('button')!.click()
    await nextTick()
    expect(document.body.innerHTML).toBe('<div><button>toggle</button>Status: success<div>hidden</div></div>')
    expect(fetch).toBeCalledTimes(1)

    document.querySelector('button')!.click()
    expect(document.body.innerHTML).toBe('<div><button>toggle</button>Status: pending<div>visible</div></div>')
    await nextTick()
    expect(document.body.innerHTML).toBe('<div><button>toggle</button>Status: success<div>visible</div></div>')
    expect(fetch).toBeCalledTimes(2)
  })

  it('should not repeat request if used the same request instance', async () => {
    function App(_props: {}, sources: Sources) {
      const githubApiRequest = sources.HTTP.request('https://api.github.com/')

      const status$ = githubApiRequest.response$
        .map(res => res.status)
        .startWith('pending')

      const buttonRef = sources.DOM.createRef()
      const className$  = buttonRef
        .events('click')
        .fold(x => !x, true)
        .map(x => x ? 'visible' : 'hidden')

      const req = githubApiRequest.makeRequest()

      return className$.map(className => (
        <div className={className}>
          {req}
          <button ref={buttonRef}>toggle</button>
          Status: {status$}
        </div>
      ))
    }

    document.body.innerHTML = '<div id="app">Loading...</div>'

    const fetch = jest.fn(createFakeFetch({ result: 'result' }))

    run(<App />, {
      DOM: makeDOMDriver('#app'),
      HTTP: makeHTTPDriver({ fetch }),
    })

    expect(document.body.innerHTML).toBe('<div class="visible"><button>toggle</button>Status: pending</div>')
    await nextTick()
    expect(document.body.innerHTML).toBe('<div class="visible"><button>toggle</button>Status: success</div>')

    document.querySelector('button')!.click()
    expect(document.body.innerHTML).toBe('<div class="hidden"><button>toggle</button>Status: success</div>')
    await nextTick()
    expect(document.body.innerHTML).toBe('<div class="hidden"><button>toggle</button>Status: success</div>')
    expect(fetch).toBeCalledTimes(1)

    document.querySelector('button')!.click()
    expect(document.body.innerHTML).toBe('<div class="visible"><button>toggle</button>Status: success</div>')
    await nextTick()
    expect(document.body.innerHTML).toBe('<div class="visible"><button>toggle</button>Status: success</div>')
    expect(fetch).toBeCalledTimes(1)
  })
})
