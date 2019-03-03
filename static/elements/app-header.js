const Tram = require('tram-one')
const html = Tram.html()

module.exports = (attrs, children) => {
  const style = `
    color: #e6ef9f; background: black;
    cursor: pointer; text-align: center;
    padding: 1em; user-select: none;
    margin: -8px -8px 8px -8px;
  `

  navHome = () => {
    history.pushState({}, '', '/')
  }

  return html`
    <h1 style=${style} onclick=${navHome}>
      ${children}
    </h1>
  `
}
