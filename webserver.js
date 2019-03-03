// webserver.js
// a webserver that exposes endpoints to trigger the printer

// network dependency
const os = require('os');

// figure out what network we're on, so we can display it to the user
const networks = os.networkInterfaces();
// flatten all the possible address into one array
const addresses = Object.keys(networks).reduce(function(addrs, interface) {
  // add all the address we found on this interface to the list of addresses
  return addrs.concat(networks[interface].map(function(i) {return i.address;}));
}, []);

// if we pass 'test' as a parameter, then don't connect to the tessel
const testing = process.argv[2] == 'test';

// regex to find the one true ip address
const ipLike = /\d+\.\d+.\d+.\d+/
const ip = addresses.filter(function(address) {
  return (ipLike.test(address) && address !== "127.0.0.1");
})[0];

// webserver dependencies
const express = require('express');
const bodyParser = require('body-parser');

// setup webserver
const app = express();
app.use(bodyParser.json());

// log, to keep track of malicious users
const log = [];

var tessel, thermalprinter;
// printing dependencies
const printer = (() => {
  // try to pull in tessel packages
  try {
    if (testing) {
      tessel = null;
      throw '';
    }
    tessel = require('tessel');
    thermalprinter = require('tessel-thermalprinter');

    // setup printer
    return thermalprinter.use(tessel.port['A']);
  }
  catch(e) {
    console.warn("couldn't find tessel packages...");
    console.warn("if you're testing, this is perfectly normal.");

    // if we're testing, or don't have a tessel, fall back on the console
    return require('./src/console-printer.js');
  }
})();

// function to blink the tessel leds on and off
function blink() {
  var blinkLeds;
  if (tessel) {
    tessel.led[1].on();
    tessel.led[2].on();
    tessel.led[3].on();
    blinkLeds = setInterval(function() {
      tessel.led[1].toggle();
      tessel.led[2].toggle();
      tessel.led[3].toggle();
    }, 100);
    setTimeout(function() {
      clearInterval(blinkLeds);
      tessel.led[1].off();
      tessel.led[2].off();
      tessel.led[3].off();
    }, 2500)
  }
}

// function to animate the tessel leds in a pattern
function pattern() {
  var patternLeds;
  if (tessel) {
    var switches = ['on', 'off', 'off'];
    tessel.led[1][switches[0]]();
    tessel.led[2][switches[1]]();
    tessel.led[3][switches[2]]();
    patternLeds = setInterval(function() {
      // rotate the switches
      switches.unshift(switches.pop())
      tessel.led[1][switches[0]]();
      tessel.led[2][switches[1]]();
      tessel.led[3][switches[2]]();
    }, 100);
    setTimeout(function() {
      clearInterval(patternLeds)
      tessel.led[1].off();
      tessel.led[2].off();
      tessel.led[3].off();
    }, 4500);
  }
}

// allow cross origin requests for our print endpoint
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// make sure we have the right server
app.get('/ping', function(req, res) {
  // send nothing, we exist, isn't that enough?!?!
  res.sendStatus(204);
  // blink on the tessel, because we asked if we were here!
  blink();
});

// print endpoint that triggers a print
app.post('/print', function (req, res, next) {

  // throttle how many requests can come in from the same ip
  if (log.length > 0) {
    if (  (req.ip == log[log.length - 1].ip) &&
          (((new Date) - (log[log.length - 1].timestamp)) < 15000)
    ) {
      res.sendStatus(429);
      return;
    }
  }
  log.push({type: 'ticket', ip: req.ip, timestamp: new Date});

  // validate the ticket exists, and has the things we want
  const ticket = Object.assign({}, req.body);
  if (!ticket.name || !ticket.date || !ticket.category) {
    res.sendStatus(400);
    return;
  }

  // do a fancy pattern on the tessel, because we were told to print!
  pattern();

  const spaceBetween = (field, spaces, value) => {
    return field + '.'.repeat(spaces - field.length - value.length) + value
  }

  // print the JSON
  printer
    .center()
    .horizontalLine(32)
    .lineFeed(12)
    .printLine(spaceBetween("NAME", 22, ticket.name))
    .printLine(spaceBetween("CATEGORY", 22, ticket.category))
    .printLine(spaceBetween("DATE", 22, ticket.date))
    .left(true)
    .lineFeed(3)
    .horizontalLine(32)
    .lineFeed(1)
    .print(function() {
      res.sendStatus(204);
    });

});

// print endpoint that prints the log
app.get('/paranoia', function (req, res, next) {

  if (log.length > 0) {
    if (  (req.ip == log[log.length - 1].ip) &&
          (((new Date) - (log[log.length - 1].timestamp)) < 15000)
    ) {
      res.sendStatus(429);
      return;
    }
  }
  log.push({type: 'log', ip: req.ip, timestamp: new Date});

  // do a fancy pattern on the tessel, because we were told to print!
  pattern();

  // print the log
  const queuedPrinter = log.reduce((printerObject, event) => {
    return printerObject
              .horizontalLine(16)
              .left()
              .printLine(event.ip)
              .right()
              .printLine(event.type)
              .printLine(event.timestamp);
  }, printer);
  queuedPrinter
    .print(function() {
      res.sendStatus(204);
    });

});

// Start the server
var port = 1335;
app.listen(port, function () {
  // blink on the tessel that we're running!
  blink();

  // log what our ip is on the console
  console.log('Ticket-Printer listening on '+ip+':'+port);

  // sometimes, we might not have a console, so this will work too
  printer.on('ready', function(){
    printer
      .center()
      .horizontalLine(16)
      .printLine('Food tickets!')
      .printLine('listening on:')
      .inverse(true)
      .printLine(' '+ip+':'+port+' ')
      .inverse(false)
      .lineFeed(5)
      .print(function(){});
  });
});
