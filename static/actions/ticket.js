module.exports = {
  init: () => ({
    name: '',
    category: '',
  }),
  setName: (ticket, name) => Object.assign({}, ticket, {name}),
  setCategory: (ticket, category) => Object.assign({}, ticket, {category}),
}
