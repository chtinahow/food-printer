const Tram = require('tram-one')

const app = new Tram({ defaultRoute: '/name' })
app.addRoute('/name', require('./pages/name'))
app.addRoute('/category', require('./pages/category'))
app.addRoute('/summary', require('./pages/summary'))
app.addActions({ ticket: require('./actions/ticket') })
app.start('.main')
