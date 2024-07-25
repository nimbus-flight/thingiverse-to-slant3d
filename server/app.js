const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fetch = import("node-fetch");
const fs = require("fs");
const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/slant3d-proxy", async (req, res) => {
  try {
    const fs = require("fs");
    const tempDir = "./temp";

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    const { fileURL, thingName } = req.body;

    // Check if fileURL and thingName are received correctly
    console.log("Received fileURL:", fileURL);
    console.log("Received thingName:", thingName);

    const safeThingName = thingName.replace(/[^a-zA-Z0-9-_.]/g, "");
    const filePath = `./temp/${safeThingName}.stl`;

    const axios = (await import("axios")).default;
    const fetch = (await import("node-fetch")).default;

    // Download STL file
    const fileResponse = await fetch(fileURL);
    console.log("File response status:", fileResponse.status);
    //console.log("File response headers:", fileResponse.headers);

    if (!fileResponse.ok) throw new Error(`Unexpected response ${fileResponse.statusText}`);
    if (fileResponse.status >= 300 && fileResponse.status < 400) {
      const redirectedUrl = fileResponse.headers.get('location');
      console.log('Redirected to:', redirectedUrl);
      return res.redirect(redirectedUrl);
    }

    const fileStream = fs.createWriteStream(filePath);
    await new Promise((resolve, reject) => {
      fileResponse.body.pipe(fileStream);
      fileResponse.body.on("error", reject);
      fileStream.on("finish", resolve);
    });

    console.log("File downloaded to:", filePath);

    // Send request to Slant 3D API with file path
    const quoteResponse = await fetch("http://localhost:3001/api/slant3d-proxy", {
        method: "POST",
        headers: {
          "api-key": req.header("api-key"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileURL: fileURL, thingName }), // Include fileURL here
      });

    console.log("Raw response from Slant 3D:", quoteResponse.data);

    res.json(quoteResponse.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error("Error details:", error);
  }
});

app.listen(3001, () => console.log("Proxy server running on port 3001"));

