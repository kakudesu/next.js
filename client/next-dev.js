import stripAnsi from 'strip-ansi'
import initNext, * as next from './'
import DevErrorOverlay from './dev-error-overlay'
import initOnDemandEntries from './on-demand-entries-client'
import initWebpackHMR from './webpack-hot-middleware-client'
import {applySourcemaps} from './source-map-support'

window.next = next

initNext({ DevErrorOverlay, applySourcemaps, stripAnsi })
  .then((emitter) => {
    initOnDemandEntries()
    initWebpackHMR()

    let lastScroll

    emitter.on('before-reactdom-render', ({ Component, ErrorComponent }) => {
      // Remember scroll when ErrorComponent is being rendered to later restore it
      if (!lastScroll && Component === ErrorComponent) {
        const { pageXOffset, pageYOffset } = window
        lastScroll = {
          x: pageXOffset,
          y: pageYOffset
        }
      }
    })

    emitter.on('after-reactdom-render', ({ Component, ErrorComponent }) => {
      if (lastScroll && Component !== ErrorComponent) {
        // Restore scroll after ErrorComponent was replaced with a page component by HMR
        const { x, y } = lastScroll
        window.scroll(x, y)
        lastScroll = null
      }
    })
  })
  .catch((err) => {
    console.error(stripAnsi(`${err.message}\n${err.stack}`))
  })
