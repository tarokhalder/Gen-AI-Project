const API_URL = "http://127.0.0.1:8000/research";

const form = document.getElementById("research-form");
const topicInput = document.getElementById("topic");
const researchButton = document.getElementById("research-button");
const buttonLabel = document.getElementById("button-label");

const welcomeState = document.getElementById("welcome-state");
const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const resultState = document.getElementById("result-state");

const reportHeading = document.getElementById("report-heading");
const reportBadge = document.getElementById("report-badge");
const loadingMessage = document.getElementById("loading-message");
const errorMessage = document.getElementById("error-message");

const resultTopic = document.getElementById("result-topic");
const resultSourceCount = document.getElementById("result-source-count");
const reportContent = document.getElementById("report-content");
const sourcesList = document.getElementById("sources-list");
const sourcesCountBadge = document.getElementById("sources-count-badge");
const copyButton = document.getElementById("copy-button");
const retryButton = document.getElementById("retry-button");

let lastReport = "";
let lastTopic = "";

function showState(state) {
    welcomeState.classList.toggle("hidden", state !== "welcome");
    loadingState.classList.toggle("hidden", state !== "loading");
    errorState.classList.toggle("hidden", state !== "error");
    resultState.classList.toggle("hidden", state !== "result");
}

function setLoading(isLoading) {
    researchButton.disabled = isLoading;
    buttonLabel.textContent = isLoading
        ? "Researching..."
        : "Generate research report";

    reportBadge.textContent = isLoading ? "WORKING" : "READY";
    reportHeading.textContent = isLoading
        ? "Research in progress"
        : "Research overview";
}

function showError(message) {
    showState("error");
    reportBadge.textContent = "ERROR";
    reportHeading.textContent = "Research overview";
    errorMessage.textContent = message;
}

function renderReport(report) {
    reportContent.replaceChildren();

    const lines = String(report || "No report was returned.")
        .replace(/\r/g, "")
        .split("\n");

    let paragraphLines = [];

    function flushParagraph() {
        if (!paragraphLines.length) return;

        const paragraph = document.createElement("p");
        paragraph.textContent = paragraphLines.join(" ");
        reportContent.appendChild(paragraph);
        paragraphLines = [];
    }

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!line) {
            flushParagraph();
            continue;
        }

        const headingMatch = line.match(/^#{1,4}\s+(.+)$/);
        const numberedHeading = line.match(/^\d+[.)]\s+(.+)$/);

        if (headingMatch || numberedHeading) {
            flushParagraph();

            const heading = document.createElement("h2");
            heading.textContent = headingMatch
                ? headingMatch[1]
                : numberedHeading[1];

            reportContent.appendChild(heading);
            continue;
        }

        if (/^[-*]\s+/.test(line)) {
            flushParagraph();

            const item = document.createElement("p");
            item.textContent = "• " + line.replace(/^[-*]\s+/, "");
            reportContent.appendChild(item);
            continue;
        }

        paragraphLines.push(line);
    }

    flushParagraph();
}

function renderSources(sources) {
    sourcesList.replaceChildren();

    const safeSources = Array.isArray(sources) ? sources : [];

    sourcesCountBadge.textContent = String(safeSources.length);

    safeSources.forEach((source, index) => {
        const card = document.createElement("article");
        card.className = "source-card";

        const number = document.createElement("div");
        number.className = "source-number";
        number.textContent = String(index + 1).padStart(2, "0");

        const info = document.createElement("div");
        info.className = "source-info";

        const title = document.createElement("h4");
        title.textContent = source.title || "Untitled source";

        const summary = document.createElement("p");
        const summaryText = source.summary || "No summary available.";
        summary.textContent = summaryText.length > 280
            ? summaryText.slice(0, 280).trim() + "..."
            : summaryText;

        info.append(title, summary);

        if (source.url) {
            try {
                const url = new URL(source.url);

                if (
                    url.protocol === "https:" &&
                    url.hostname === "en.wikipedia.org"
                ) {
                    const link = document.createElement("a");
                    link.className = "source-link";
                    link.href = url.href;
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    link.textContent = "Read original article ↗";
                    info.appendChild(link);
                }
            } catch {
                // Ignore invalid source URLs.
            }
        }

        card.append(number, info);
        sourcesList.appendChild(card);
    });
}

async function runResearch(topic) {
    lastTopic = topic;

    setLoading(true);
    showState("loading");
    loadingMessage.textContent = "Searching Wikipedia and preparing your research...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ topic })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const detail = data.detail;
            const message = typeof detail === "string"
                ? detail
                : "The research request failed. Please try again.";

            throw new Error(message);
        }

        lastReport = String(data.report || "");

        resultTopic.textContent = data.topic || topic;

        const sources = Array.isArray(data.sources) ? data.sources : [];
        const sourceCount = Number.isFinite(data.source_count)
            ? data.source_count
            : sources.length;

        resultSourceCount.textContent =
            `${sourceCount} source${sourceCount === 1 ? "" : "s"} found`;

        renderReport(lastReport);
        renderSources(sources);

        reportBadge.textContent = "COMPLETE";
        reportHeading.textContent = "Research overview";
        showState("result");

    } catch (error) {
        let message = error.message || "Something went wrong.";

        if (error instanceof TypeError) {
            message =
                "Could not connect to the API. Make sure FastAPI is running at http://127.0.0.1:8000 and CORS is configured.";
        }

        showError(message);

    } finally {
        setLoading(false);
    }
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const topic = topicInput.value.trim();

    if (topic.length < 3) {
        topicInput.focus();
        topicInput.setCustomValidity(
            "Please enter a topic with at least 3 characters."
        );
        topicInput.reportValidity();
        topicInput.setCustomValidity("");
        return;
    }

    if (topic.length > 200) {
        topicInput.focus();
        return;
    }

    runResearch(topic);
});

topicInput.addEventListener("input", () => {
    topicInput.setCustomValidity("");
});

document.querySelectorAll("[data-topic]").forEach((button) => {
    button.addEventListener("click", () => {
        topicInput.value = button.dataset.topic;
        topicInput.focus();
    });
});

retryButton.addEventListener("click", () => {
    if (lastTopic) {
        runResearch(lastTopic);
    }
});

copyButton.addEventListener("click", async () => {
    if (!lastReport) return;

    try {
        await navigator.clipboard.writeText(
            `${lastTopic}\n\n${lastReport}`
        );

        copyButton.textContent = "✓ Copied!";

        setTimeout(() => {
            copyButton.textContent = "▢ Copy report";
        }, 1800);

    } catch {
        copyButton.textContent = "Copy unavailable";

        setTimeout(() => {
            copyButton.textContent = "▢ Copy report";
        }, 1800);
    }
});