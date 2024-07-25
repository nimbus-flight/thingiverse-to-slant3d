const thingiverseUrlInput = document.getElementById("thingiverseUrl");
const downloadButton = document.getElementById("downloadButton");
const errorDiv = document.getElementById("error");
const apiTokenInput = document.getElementById("apiTokenInput"); // Assuming you have an input for the token
const API_BASE = "https://api.thingiverse.com";

downloadButton.addEventListener("click", async () => {
  const thingiverseUrl = thingiverseUrlInput.value;
  const token = apiTokenInput.value; // Get token value inside the click handler
  errorDiv.style.display = "none"; // Clear previous errors

  if (thingiverseUrl && token) { // Check if both URL and token are present
    try {
      const thingId = getThingIdFromUrl(thingiverseUrl);
      console.log("Using token:", token);

      const thingResponse = await fetch(`${API_BASE}/things/${thingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!thingResponse.ok) {
        handleApiError(thingResponse);
      } else {
        const thingData = await thingResponse.json();

        const fileResponse = await fetch(`${API_BASE}/things/${thingId}/files`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!fileResponse.ok) {
          handleApiError(fileResponse);
        } else {
          const filesData = await fileResponse.json();
          const stlFile = filesData.find((file) => file.name.endsWith(".stl"));

          if (stlFile) {
            downloadFile(stlFile.public_url, `${thingData.name}.stl`);
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
function downloadFile(url, fileName) {
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
}

