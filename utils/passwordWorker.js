const { parentPort, workerData } = require("worker_threads");
const bcrypt = require("bcrypt");

const { password, saltRounds } = workerData;

bcrypt
  .hash(password, saltRounds)
  .then((hash) => {
    parentPort.postMessage({ hash });
  })
  .catch((error) => {
    parentPort.postMessage({ error: error.message });
  });
