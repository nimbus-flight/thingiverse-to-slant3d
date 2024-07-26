const thingiverseUrlInput = document.getElementById("thingiverseUrl");
const getSlant3DQuote = document.getElementById("getSlant3DQuote");
const errorDiv = document.getElementById("error");
const apiTokenInputThing = document.getElementById("apiTokenInputThing");
const slant3dApiKeyInput = document.getElementById("slant3dApiKey");

const API_BASE = "https://api.thingiverse.com";

getSlant3DQuote.addEventListener("click", async () => {
  const thingiverseUrl = thingiverseUrlInput.value;
  const token = apiTokenInputThing.value;
  const slant3dApiKey = slant3dApiKeyInput.value;
  errorDiv.style.display = "none"; // Clear previous errors

  if (thingiverseUrl && token && slant3dApiKey) {
    try {
      const thingId = getThingIdFromUrl(thingiverseUrl);
      console.log("Using token:", token);

      // Fetch Thing details (to get the Thing name)
      const thingResponse = await fetch(`${API_BASE}/things/${thingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!thingResponse.ok) {
        handleApiError(thingResponse);
      } else {
        const thingData = await thingResponse.json();

        // Fetch file details (to get file URLs)
        const fileResponse = await fetch(
          `${API_BASE}/things/${thingId}/files`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!fileResponse.ok) {
          handleApiError(fileResponse);
        } else {
          const filesData = await fileResponse.json();
          const stlFiles = filesData.filter((file) =>
            file.name.endsWith(".stl")
          );

          if (stlFiles.length > 0) {
            const quotes = [];

            for (const stlFile of stlFiles) {
              // Display STL file size
              const fileSizeInBytes = stlFile.size;
              const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2);
              errorDiv.textContent += `${thingData.name} (${stlFile.name}): ${fileSizeInKB} KB\n`;
              errorDiv.style.display = "block"; 

              // Fetch quote
              const fileUrl = stlFile.public_url;
              const quoteResponse = await fetch(
                "http://localhost:3001/api/slant3d-proxy",
                {
                  method: "POST",
                  headers: {
                    "api-key": slant3dApiKey,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    fileURL: fileUrl,
                    thingName: thingData.name,
                  }),
                }
              );

              if (!quoteResponse.ok) {
                handleApiError(quoteResponse, "Slant 3D API");
              } else {
                const quoteData = await quoteResponse.json();
                console.log(`Slant 3D Quote for ${stlFile.name}:`, quoteData);
                quotes.push({ fileName: stlFile.name, quote: quoteData });
              }
            } // End of for loop

            // Display all quotes after the loop has finished
            if (quotes.length > 0) {
              let quoteText = "";
              for (const quote of quotes) {
                quoteText += `Quote for ${thingData.name} (${
                  quote.fileName
                }): $${quote.quote.price}\n`;
              }
              errorDiv.textContent = quoteText;
              errorDiv.style.display = "block";
            }
          } else {
            throw new Error("No STL files found for this Thing");
          }
        }
      }
    } catch (error) {
      errorDiv.textContent = error.message;
      errorDiv.style.display = "block";
      console.error("Error details:", error);
    }
  } else {
    errorDiv.textContent =
      "Please enter Thingiverse URL, API token, and Slant 3D API key.";
    errorDiv.style.display = "block";
  }
});

// Helper function to extract Thing ID from URL
function getThingIdFromUrl(url) {
  const match = url.match(/\/thing:(\d+)/);
  return match ? match[1] : null;
}

// Helper function to handle API errors
async function handleApiError(response, apiName = "Thingiverse API") {
  let errorMessage = `API Error (${response.status}) from ${apiName}`;
  try {
    const errorData = await response.json();
    // Check if errorData is an object with an error property
    if (
      typeof errorData === "object" &&
      errorData !== null &&
      errorData.error
    ) {
      errorMessage += `: ${errorData.error}`;
    }
  } catch (jsonError) {
    // Log JSON parsing error specifically
    console.error(`Error parsing JSON response from ${apiName}:`, jsonError);
  }
  throw new Error(errorMessage);
}
