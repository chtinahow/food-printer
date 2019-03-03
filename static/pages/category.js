const Tram = require('tram-one')
const html = Tram.html({
  'app-header': require('../elements/app-header'),
  'option-button': require('../elements/option-button')
})

module.exports = (store, actions) => {
  const setCategory = category => {
    actions.setCategory(category)
    history.pushState({}, '', '/summary')
  }

  const categories = [
    'American',
    'Asian',
    'BBQ',
    'Bakery',
    'Chicken',
    'Sandwiches',
    'Dessert',
    'Halal',
    'Italian',
    'Indian',
    'Mexican',
    'Pizza',
    'Salad',
    'Seafood',
    'Soup',
    'Wings'
  ]

  const categoryButtons = categories.map(
    category => html`<option-button onclick=${() => setCategory(category)}>${category}</option-button>`
  )

  return html`
    <div style="margin: auto;">
      <app-header>Category</app-header>
      <div style="display: flex; flex-wrap: wrap;">
        ${categoryButtons}
      </div>
    </div>
  `
}
