const thingiverseUrlInput = document.getElementById("thingiverseUrl");
const getSlant3DQuote = document.getElementById("getSlant3DQuote");
const errorDiv = document.getElementById("error");
const apiTokenInputThing = document.getElementById("apiTokenInputThing"); // Assuming you have an input for the token
const slant3dApiKeyInput = document.getElementById("slant3dApiKey");

const API_BASE = "https://api.thingiverse.com";

getSlant3DQuote.addEventListener("click", async () => {
  const thingiverseUrl = thingiverseUrlInput.value;
  const token = apiTokenInputThing.value;
  const slant3dApiKey = slant3dApiKeyInput.value;

  errorDiv.style.display = "none";

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

        // Fetch file details (to get file size)
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
          const stlFile = filesData.find((file) => file.name.endsWith(".stl"));
          console.log(stlFile);

          if (stlFile) {
            // Display STL file size
            const fileSizeInBytes = stlFile.size;
            const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2);
            errorDiv.textContent = `${thingData.name}.stl: ${fileSizeInKB} KB`;
            errorDiv.style.display = "block";
          } else {
            throw new Error("No STL file found for this Thing");
          }

          if (stlFile) {
            const fileURL = stlFile.public_url;
            const thingName = thingData.name;
            console.log(thingData, thingName);
            const quoteResponse = await fetch("http://localhost:3001/api/slant3d-proxy", {
              method: "POST",
              headers: {
                "api-key": slant3dApiKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ fileURL: fileURL, thingName:thingName }),
            });

            if (!quoteResponse.ok) {
              handleApiError(quoteResponse);
            } else {
              const quoteData = await quoteResponse.json();
              console.log("Slant 3D Quote:", quoteData); // Handle quote data
              errorDiv.textContent = `Quote for ${thingData.name}: $${quoteData.price}`;
              errorDiv.style.display = "block";
            }
          } else {
            throw new Error("No STL file found for this Thing");
          }
        }
      }
    } catch (error) {
      errorDiv.textContent = error.message;
      errorDiv.style.display = "block";
      console.error("Error details:", error);
    }
  } else {
    errorDiv.textContent = "Please enter both Thingiverse URL and API token.";
    errorDiv.style.display = "block";
  }
});

// Helper function to extract Thing ID from URL (implement this based on Thingiverse URL structure)
function getThingIdFromUrl(url) {
  const match = url.match(/\/thing:(\d+)/);
  return match ? match[1] : null;
}

// Helper function to handle API errors
async function handleApiError(response) {
  let errorMessage = `API Error (${response.status})`;
  try {
    const errorData = await response.json();
    if (errorData.error) {
      errorMessage += `: ${errorData.error}`;
    }
  } catch (jsonError) {
    // If JSON parsing fails, use the default error message
  }
  throw new Error(errorMessage);
}

// Helper function to download a file
function getQuote(url, fileName) {
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("slant3d-Quote", fileName);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
}
