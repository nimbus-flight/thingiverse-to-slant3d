const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));   
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
    const fileResponse = await fetch(fileURL);
    if (!fileResponse.ok)
      throw new Error(`Unexpected response ${fileResponse.statusText}`);

    if (fileResponse.status >= 300 && fileResponse.status < 400) {
      const redirectedUrl = fileResponse.headers.get("location");
      console.log("Redirected to:", redirectedUrl);
      return res.redirect(redirectedUrl);
    }

    const fileStream = fs.createWriteStream(filePath);

    // Wait for file download to complete
    await new Promise((resolve, reject) => {
      fileResponse.body.pipe(fileStream);
      fileResponse.body.on("error", reject);
      fileStream.on("finish", resolve); // Resolve the promise when the file is written
    });

    console.log("File downloaded to:", filePath);

    // Now send the request to Slant 3D API
    const quoteResponse = await axios.post(
      "https://www.slant3dapi.com/api/slicer",
      {
        filePath: filePath,
      },
      {
        headers: {
          "api-key": req.header("api-key"),
          "Content-Type": "application/json",
        },
      }
    );

    if (quoteResponse.status !== 200) {
      throw new Error(
        `Slant 3D API Error (${quoteResponse.status}): ${quoteResponse.statusText}`
      );
    }

    res.json(quoteResponse.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error("Error details:", error);
  }
});

app.listen(3001, () => console.log("Proxy server running on port 3001"));
