const express = require('express');
const spawn = require('child_process').spawn;
const path = require('path');
const request = require('request');

var router = express.Router();

var processes = [];
var startingPort = servicePort = parseInt(process.env.PORT) + 1;

function spawnNewService() {
  var proc = spawn('node', [path.resolve(__dirname, '../../service1/bin/www')], {
    env: Object.assign({}, process.env, {
      PORT: servicePort
    })
  });
  // use event hooks to provide a callback to execute when data are available:
  proc.stdout.on('data', function(data) {
    console.log(data.toString());
  });

  proc.stderr.on('data', function(data) {
    console.log(data.toString());
  });

  processes.push({proc, port: servicePort});
  servicePort++;
}

function killService(port) {
  if(!port) {
    return;
  }

  if(processes.length > 1) {
    var procIndex = processes.findIndex(p => p.port == port);
    processes[procIndex].proc.kill();
    processes.splice(procIndex, 1);
  }
}

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

function randomPort(low, high) {
  return processes[randomInt(0, processes.length)].port;
}

spawnNewService();

/* GET home page. */
router.get('/', function(req, res, next) {
  const port = randomPort(startingPort, servicePort);
  request('http://localhost:' + port, (error, response, body) => {
    console.log('Result from: ', port);
    if (!error && response.statusCode == 200) {
      const parsedBody = JSON.parse(body);
      if(parsedBody.load == 0) {
        console.log('scale down!', port);
        killService(port);
      }
      res.status(200);
      res.send(body);
      return;
    }
    if (!error && response.statusCode == 429) {
      console.log('scale up!');
      spawnNewService();
      return;
    }

    res.status(500);
    res.send(error);
  });
});

module.exports = router;
