const API_URL = "http://127.0.0.1:8000/api/editorial";

const generateBtn = document.getElementById("generateBtn");
const loading = document.getElementById("loading");
const output = document.getElementById("output");

generateBtn.addEventListener("click", generateEditorial);

async function generateEditorial() {
    const problem = document.getElementById("problem").value.trim();
    const code = document.getElementById("code").value.trim();
    const language = document.getElementById("language").value;

    if (!problem || !code) {
        alert("Please provide both problem statement and code.");
        return;
    }

    loading.classList.remove("hidden");
    output.classList.add("hidden");
    generateBtn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                problem,
                code,
                language
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Something went wrong");
        }

        displayEditorial(data);

    } catch (error) {
        alert(error.message);
    } finally {
        loading.classList.add("hidden");
        generateBtn.disabled = false;
    }
}

function displayEditorial(data) {
    document.getElementById("approach").textContent = data.approach;

    const algorithm = document.getElementById("algorithm");
    algorithm.innerHTML = "";

    data.algorithm.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        algorithm.appendChild(li);
    });

    document.getElementById("whyWorks").textContent = data.why_it_works;

    document.getElementById("complexity").textContent = data.complexity;

    document.getElementById("codeExplanation").textContent =
        data.code_explanation;

    const mistakes = document.getElementById("mistakes");
    mistakes.innerHTML = "";

    data.common_mistakes.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        mistakes.appendChild(li);
    });

    document.getElementById("alternative").textContent =
        data.alternative_approach;

    output.classList.remove("hidden");

    output.scrollIntoView({
        behavior: "smooth"
    });
}
