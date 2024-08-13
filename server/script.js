document.addEventListener("DOMContentLoaded", (event) => {
  const getQuoteButton = document.getElementById("getQuoteButton");
  const thingiverseIdInput = document.getElementById("thingiverseId");
  const resultsDiv = document.getElementById("results");

  getQuoteButton.addEventListener("click", async () => {
    const thingiverseId = thingiverseIdInput.value;

    if (thingiverseId) {
      resultsDiv.textContent = "Fetching Thingiverse details...";

      try {
        // 1. Fetch Thingiverse Image URL
        const imageResponse = await fetch("/get_thing_image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ thingiverseId }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          displayImage(imageData.imageUrl);

          // 2. Fetch Quotes (after displaying the image)
          resultsDiv.textContent += "\nGetting quotes, please wait...";
          const quoteResponse = await fetch("/get_quotes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ thingiverseId }),
          });

          if (quoteResponse.ok) {
            const quoteData = await quoteResponse.json();
            displayQuotes(quoteData);
          } else {
            throw new Error("Failed to get quotes from the server");
          }
        } else {
          throw new Error("Failed to fetch Thingiverse image.");
        }
      } catch (error) {
        resultsDiv.textContent = `Error: ${error.message}`;
        console.error("Error details:", error);
      }
    } else {
      resultsDiv.textContent = "Please enter a Thingiverse Thing ID.";
    }
  });

  // Function to display the image
  function displayImage(imageUrl) {
    if (imageUrl) {
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = "Thingiverse Image";
      img.width = 300;
      resultsDiv.appendChild(img);
    } else {
      resultsDiv.textContent += "\nNo image found for this Thing.";
    }
  }

  // Function to display quotes (adjust as needed)
  function displayQuotes(quoteData) {
    resultsDiv.textContent += "\nQuotes:\n";
    resultsDiv.textContent += JSON.stringify(quoteData, null, 2);
  }
});
