const Tram = require('tram-one')
const html = Tram.html()

module.exports = (attrs, children) => {
  const style = `
    display: block;
    width: 8em;
    font-size: 2em;
    height: 1.5em;
    background: mediumpurple;
    color: white;
    border-color: mediumpurple;
    margin: 0.5em;
    ${attrs.style || ''}
  `
  return html`
    <button style=${style} onclick=${attrs.onclick}>
      ${children}
    </button>
  `
}
