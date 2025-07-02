// script.js
const randomBtn = document.getElementById("random-btn");
const remixBtn = document.getElementById("remix-btn");
const remixThemeSelect = document.getElementById("remix-theme");
const recipeDisplay = document.getElementById("recipe-display");
const remixOutput = document.getElementById("remix-output");

let currentRecipeData = null;

async function fetchAndDisplayRandomRecipe() {
  recipeDisplay.innerHTML = "<p>Loading...</p>";
  remixOutput.textContent = "";

  const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
  const data = await res.json();
  currentRecipeData = data;

  const recipe = data.meals[0];

  let ingHtml = "";
  for (let i = 1; i <= 20; i++) {
    const ing = recipe[`strIngredient${i}`];
    const meas = recipe[`strMeasure${i}`];
    if (ing && ing.trim()) {
      ingHtml += `<li>${meas ? `${meas} ` : ""}${ing}</li>`;
    }
  }

  recipeDisplay.innerHTML = `
    <h2>${recipe.strMeal}</h2>
    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" />
    <div>
      <strong>Ingredients:</strong>
      <ul>${ingHtml}</ul>
    </div>
    <div>
      <strong>Instructions:</strong>
      <p>${recipe.strInstructions}</p>
    </div>
  `;
}

async function remixRecipe() {
  remixOutput.textContent = "Remixing...";
  const remixTheme = remixThemeSelect.value;
  
  const prompt = `
    Here is a recipe response from TheMealDB API:
    ${JSON.stringify(currentRecipeData)}

    Remix the first recipe in the data for this theme: "${remixTheme}"
    Give clear, step-by-step instructions and mention any changed ingredients. Make it very short, creative, fun, and actually possible.
  `;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: "You are a helpful, creative recipe developer. You understand TheMealDB API JSON." },
        { role: "user", content: prompt }
      ]
    })
  });

  const data = await response.json();
  remixOutput.textContent = data.choices?.[0]?.message?.content || "Sorry, I couldn't remix the recipe.";
}

randomBtn.addEventListener("click", fetchAndDisplayRandomRecipe);
remixBtn.addEventListener("click", remixRecipe);
document.addEventListener("DOMContentLoaded", fetchAndDisplayRandomRecipe);
