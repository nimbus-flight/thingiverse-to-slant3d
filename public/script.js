const thingiverseUrlInput = document.getElementById("thingiverseUrl");
const downloadButton = document.getElementById("downloadButton");
const errorDiv = document.getElementById("error"); 
const apiTokenInput = document.getElementById("apiTokenInput");
// ...
const token = apiTokenInput.value;
const API_BASE = "https://api.thingiverse.com";

downloadButton.addEventListener("click", async () => {
  const thingiverseUrl = thingiverseUrlInput.value;
  errorDiv.style.display = "none"; // Clear previous errors

  if (thingiverseUrl) {
    try {
      const thingId = getThingIdFromUrl(thingiverseUrl);
      const thingResponse = await fetch(`${API_BASE}/things/${thingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!thingResponse.ok) {
        throw new Error("Failed to fetch Thing details");
      }

      const thingData = await thingResponse.json();

      const fileResponse = await fetch(`${API_BASE}/things/${thingId}/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!fileResponse.ok) {
        throw new Error("Failed to fetch file details");
      }
      
      const filesData = await fileResponse.json();
      const stlFile = filesData.find(file => file.name.endsWith(".stl"));
      
      if (stlFile) {
        const fileUrl = stlFile.public_url;
        
        // Download STL file (similar logic as in previous responses)
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${thingData.name}.stl`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        throw new Error("No STL file found for this Thing");
      }
    } catch (error) {
      errorDiv.textContent = error.message; 
      errorDiv.style.display = "block"; 
      console.error("Error:", error);
    }
  }
});

// Helper function to extract Thing ID from URL
function getThingIdFromUrl(url) {
  // ... (your implementation to get Thing ID from URL)
}
