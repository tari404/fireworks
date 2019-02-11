const WebSocketServer = require('ws').Server

const wss = new WebSocketServer({
  port: 9000
})

var clients = []

wss.on('connection', ws => {
  clients.push(ws)
  ws.on('message', function (message) {
    if (message === 'ping') {
      return ws.send('pong')
    }
    clients.forEach(client => {
      if (client !== ws) {
        client.send(message)
      }
    })
  })

  ws.on('close', function () {
    clients = clients.filter(client => {
      return client !== ws
    })
  })
})
