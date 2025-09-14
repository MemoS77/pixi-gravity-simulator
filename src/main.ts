import './style.css'
import { App } from './app/App'
;(async () => {
  const app = new App()

  await app.init({ background: '#111', resizeTo: window })
  document.getElementById('pixi-container')!.appendChild(app.canvas)

  await app.run()
})()
