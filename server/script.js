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
          console.log("Image URL received:", imageData.imageUrl); // Log the received URL

          if (imageData.imageUrl) {
            displayImage(imageData.imageUrl); // Call the function if a URL is received
          } else {
            console.log("No image URL received.");
          }

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

  // Function to display quotes (adjust as needed)
  function displayQuotes(quoteData) {
    resultsDiv.textContent += "\nQuotes:\n";
    resultsDiv.textContent += JSON.stringify(quoteData, null, 2);
  }
});
