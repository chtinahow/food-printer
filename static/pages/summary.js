const Tram = require('tram-one')
const html = Tram.html({
  'app-header': require('../elements/app-header'),
  'option-button': require('../elements/option-button')
})

module.exports = (store, actions) => {
  const onPrint = () => {
    window.fetch(`/print`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: store.ticket.name,
        category: store.ticket.category,
        date: (new Date()).toDateString()
      })
    })
      .then(res => res.json)
      .then(response => {
        console.log(response)
        history.pushState({}, '', '/name')
      })
  }

  const ticketPreviewStyle = `
    background: white;
    border: solid;
    width: 15em;
    margin: auto;
    padding-top: 12em;
    padding-bottom: 2em;
    text-align: center;
    font-family: monospace;
    font-size: 1.5em;
  `

  const spaceBetween = (field, spaces, value) => (
    '' + field + '.'.repeat(spaces - field.length - value.length) + value
  )

  return html`
    <div style="margin: auto;">
      <app-header>Summary</app-header>
      <div style=${ticketPreviewStyle}>
        <div>${spaceBetween('NAME', 22, store.ticket.name)}</div>
        <div>${spaceBetween('CATEGORY', 22, store.ticket.category)}</div>
        <div>${spaceBetween('DATE', 22, (new Date).toDateString())}</div>
      </div>
      <option-button style="margin: 1em auto;" onclick=${onPrint}>PRINT</option-button>
    </div>
  `
}
