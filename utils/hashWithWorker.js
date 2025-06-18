const { Worker } = require("worker_threads");
const path = require("path");

function hashPasswordWithWorker(password, saltRounds = 10) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve(__dirname, "passwordWorker.js"), {
      workerData: { password, saltRounds },
    });

    worker.on("message", (data) => {
      if (data.error) reject(new Error(data.error));
      else resolve(data.hash);
    });

    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with code ${code}`));
    });
  });
}

module.exports = hashPasswordWithWorker;
