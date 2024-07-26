const getQuoteButton = document.getElementById("getQuoteButton");
const thingiverseUrlInput = document.getElementById("thingiverseUrl");
const thingiverseApiTokenInput = document.getElementById("thingiverseApiToken");
const slant3dApiKeyInput = document.getElementById("slant3dApiKey");
const resultsDiv = document.getElementById("results");

getQuoteButton.addEventListener("click", async () => {
    const thingiverseUrl = thingiverseUrlInput.value;
    const thingiverseToken = thingiverseApiTokenInput.value;
    const slant3dApiKey = slant3dApiKeyInput.value;

    if (thingiverseUrl && thingiverseToken && slant3dApiKey) {
        try {
            const response = await fetch("/get_quotes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    thingiverseUrl,
                    thingiverseToken,
                    slant3dApiKey,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                // Update the results div with the quote data
                resultsDiv.textContent = JSON.stringify(data, null, 2); // Pretty-print JSON for readability
            } else {
                throw new Error("Failed to get quotes from the server");
            }
        } catch (error) {
            resultsDiv.textContent = `Error: ${error.message}`;
            console.error("Error details:", error);
        }
    } else {
        resultsDiv.textContent = "Please fill out all fields.";
    }
});
