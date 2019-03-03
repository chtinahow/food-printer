const Tram = require('tram-one')
const html = Tram.html({
  'app-header': require('../elements/app-header'),
  'option-button': require('../elements/option-button')
})

module.exports = (store, actions) => {
  const setName = name => {
    actions.setName(name)
    history.pushState({}, '', '/category')
  }

  const names = [
    'Jesse',
    'Tina',
    'Randy',
    'Kai',
    'Sprocket'
  ]

  const nameButtons = names.map(
    name => html`<option-button style='margin: 1em auto;' onclick=${() => setName(name)}>${name}</option-button>`
  )

  return html`
    <div style="margin: auto;">
      <app-header>Name</app-header>
      ${nameButtons}
    </div>
  `
}
