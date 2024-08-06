document.addEventListener('DOMContentLoaded', (event) => {
    const getQuoteButton = document.getElementById("getQuoteButton");
    const thingiverseIdInput = document.getElementById("thingiverseId");
    const resultsDiv = document.getElementById("results");

    getQuoteButton.addEventListener("click", async () => {
        const thingiverseId = thingiverseIdInput.value; // Get the Thing ID directly

        if (thingiverseId) { 
            resultsDiv.textContent = "Getting quotes, please wait..."; 

            try {
                const response = await fetch("/get_quotes", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ thingiverseId }), 
                });

                if (response.ok) {
                    const data = await response.json();
                    resultsDiv.textContent = JSON.stringify(data, null, 2); 
                } else {
                    throw new Error("Failed to get quotes from the server");
                }
            } catch (error) {
                resultsDiv.textContent = `Error: ${error.message}`;
                console.error("Error details:", error);
            }
        } else {
            resultsDiv.textContent = "Please enter a Thingiverse Thing ID.";
        }
    });
});
