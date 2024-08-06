document.addEventListener('DOMContentLoaded', (event) => {
    const getQuoteButton = document.getElementById("getQuoteButton");
    const thingiverseUrlInput = document.getElementById("thingiverseUrl");
    const resultsDiv = document.getElementById("results");

    getQuoteButton.addEventListener("click", async () => {
        const thingiverseUrl = thingiverseUrlInput.value;

        if (thingiverseUrl) { 
            resultsDiv.textContent = "Getting quotes, please wait..."; 

            try {
                const response = await fetch("/get_quotes", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ thingiverseUrl }), 
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
            resultsDiv.textContent = "Please enter a Thingiverse URL.";
        }
    });
});
