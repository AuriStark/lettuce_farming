const express = require("express");
var cors = require("cors");
const Db = require("./db/db");
const BotController = require("./farmbot/BotController");
const http = require("http");
const { Server } = require("socket.io");

const {
  lunchScheduling,
  startjobWithID,
  startjobWithPayload,
} = require("./scheduling.js");

const { runCode, analyzeCode } = require("./script/code.js");

const DB = new Db();

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const botController = new BotController(true, io);

app.get("/", (req, res) => {
  res.send("Hello frambot");
});

/* app.post("/addjob", async (req, res) => {
  try {
    const seeding = await DB.insertJobToDB(req.body);
    res.status(200).json(seeding);
    console.log("New job added");
  } catch (error) {
    console.log(error.message);
  }
  res.end();
}); */

app.post("/addjob", async (req, res) => {
  try {
    const result = await DB.insertJobToDB(req.body);
    res.status(200).json({ message: "Job added", result });

    botController.resendJobs();
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

app.post("/startjob", async (req, res) => {
  try {
    // Get the datas of the job
    const { id } = req.body;

    let started = await startjobWithID(id, botController);

    if (started) {
      res.status(200).json({ message: `Jobb : "${id}" is in queue` });
    } else {
      res.status(200).json({ message: `Job : "${id}" started` });
    }
  } catch (error) {
    console.log(error.message);
  }
  res.end();
});

app.post("/starthumidityjob", async (req, res) => {
  try {
    // Get the datas of the job
    const { cropType } = req.body;

    let payload = {
      cropType,
      name: "Measure Humidity",
      operation: "humidity",
    };

    let started = await startjobWithPayload(payload, botController);

    if (started) {
      res
        .status(200)
        .json({ message: `Jobb : the humidity measurement is in queue` });
    } else {
      res
        .status(200)
        .json({ message: "Job : the humidity measurement is started" });
    }
  } catch (error) {
    console.log(error.message);
  }
  res.end();
});

app.get("/listjobs", async (req, res) => {
  try {
    const jobs = await DB.listAllJobs();
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/listjobsqueue", async (req, res) => {
  try {
    const jobs = await botController.getJobInQueueFromIDS();
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/job/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const job = await DB.getJobById(id);
    if (!job) {
      return res
        .status(404)
        .json({ message: "cannot find a job with this id" });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/job/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const job = await DB.deleteJob(id);
    if (!job) {
      return res
        .status(404)
        .json({ message: "cannot find product in database" });
    }
    res.status(200).json({ message: "successfully deleted" });

    botController.resendJobs();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/editjob/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const seeding = await DB.editJob(id, req.body);
    if (!seeding) {
      return res.status(404).json({ message: "cannot find job in database" });
    }

    const updateseeding = await DB.getJobById(id);
    res.status(200).json(updateseeding);

    botController.resendJobs();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/job/:operation", async (req, res) => {
  try {
    const { operation } = req.params;
    const seeding = await DB.getJobByOperation(operation);
    res.status(200).json(seeding);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/listseeds", async (req, res) => {
  try {
    const seeding = await DB.listAllSeeds();
    res.status(200).json(seeding);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/emergencyLock", async (req, res) => {
  try {
    await botController.emergencyLock();
    res.status(200).json({ message: "Farmbot locked" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/emergencyUnLock", async (req, res) => {
  try {
    await botController.emergencyUnLock();
    res.status(200).json({ message: "Farmbot unlocked" });
  } catch (error) {
    console.log("xxxxxxxxxxxxxxx", error);
    res.status(500).json({ message: error.message });
  }
});

app.put("/saveSetting", async (req, res) => {
  try {
    const setting = await DB.editUser(req.body);
    if (!setting) {
      return res.status(404).json();
    }

    res.status(200).json(setting);

    botController.broadcast("userDatas", setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//----------------[Code]
app.post("/analyzeCode", async (req, res) => {
  try {
    // Get the code to run
    const { code } = req.body;

    let result = await analyzeCode(code, botController);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  res.end();
});

app.post("/runCode", async (req, res) => {
  try {
    // Get the code to run
    const { code } = req.body;

    let result = await runCode(code, botController);

    if (result.successful) {
      res
        .status(200)
        .json({
          ...result,
          message: `Code started`,
          date: new Date().toISOString(),
        });
    } else {
      res
        .status(500)
        .json({
          ...result,
          message: `Code not started`,
          error: "",
          date: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
  res.end();
});

//configuring the socket server
const onConnection = async (socket) => {
  socket.on("getUserDatas", async () => {
    let data = await DB.getUserDatas();
    socket.emit("userDatas", data);
  });

  await botController.sendAllInfoWhenConnecting(socket);
};

io.on("connection", onConnection);

server.listen(port, () => {
  console.log("farmbot app is running on port 8000");

  setTimeout(async () => {
    await lunchScheduling(DB, botController);
  }, 10000);
});
