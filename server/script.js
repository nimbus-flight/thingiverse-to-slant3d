document.addEventListener("DOMContentLoaded", (event) => {
  const getQuoteButton = document.getElementById("getQuoteButton");
  const thingiverseIdInput = document.getElementById("thingiverseId");
  const resultsDiv = document.getElementById("results");

  // Create an object to track if a quote has been requested for specific Thingiverse IDs
  const requestedQuotes = {};

  getQuoteButton.addEventListener("click", async () => {
    const thingiverseId = thingiverseIdInput.value;

    // Check if a quote has already been requested for this specific Thingiverse ID
    if (requestedQuotes[thingiverseId]) {
      resultsDiv.textContent += `\nA quote has already been requested for Thingiverse ID ${thingiverseId}. Please enter a new ID or refresh the page to request again.`;
      return;
    }

    if (thingiverseId) {
      // Disable the button to prevent multiple clicks
      getQuoteButton.disabled = true;
      resultsDiv.textContent = "Fetching Thingiverse details...\n";

      try {
        // 1. Fetch Thingiverse Image URL
        const imageResponse = await fetch("/get_thing_image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ thingiverseId }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          console.log("Image URL received:", imageData.imageUrl);

          if (imageData.imageUrl) {
            displayImage(imageData.imageUrl);
          } else {
            console.log("No image URL received.");
          }

          // 2. Fetch Quotes (after displaying the image)
          resultsDiv.textContent += "Getting quotes, please wait...\n";
          const quoteResponse = await fetch("/get_quotes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ thingiverseId }),
          });

          if (quoteResponse.ok) {
            const quoteData = await quoteResponse.json();
            displayQuotes(quoteData);

            // Mark the Thingiverse ID as having been requested
            requestedQuotes[thingiverseId] = true;
          } else {
            throw new Error("Failed to get quotes from the server");
          }
        } else {
          throw new Error("Failed to fetch Thingiverse image.");
        }
      } catch (error) {
        resultsDiv.textContent = `Error: ${error.message}`;
        console.error("Error details:", error);
      } finally {
        // Re-enable the button after the operation is complete
        getQuoteButton.disabled = false;
      }
    } else {
      resultsDiv.textContent = "Please enter a Thingiverse Thing ID.";
    }
  });

  function displayImage(imageUrl) {
    console.log("displayImage function called.");
    if (imageUrl) {
        console.log("Appending image with URL:", imageUrl);
        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = "Thingiverse Image";
        img.style.maxWidth = "400px";
        img.style.maxHeight = "400px";
        img.style.width = "auto"; // Maintain aspect ratio
        img.style.height = "auto"; // Maintain aspect ratio
        img.style.border = "2px solid red"; // Optional: Add a border for visibility
        document.getElementById('imageContainer').appendChild(img);
        console.log("Image appended successfully.");
    } else {
        console.log("No image URL provided.");
        document.getElementById('results').textContent += "\nNo image found for this Thing.";
    }
  }

  function displayQuotes(quoteData) {
    resultsDiv.textContent += "\nQuotes:\n";
    resultsDiv.textContent += JSON.stringify(quoteData, null, 2);
  }
});
