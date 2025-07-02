// script.js

// Get DOM elements
const randomBtn = document.getElementById("random-btn");
const remixBtn = document.getElementById("remix-btn");
const remixThemeSelect = document.getElementById("remix-theme");
const recipeDisplay = document.getElementById("recipe-display");
const remixOutput = document.getElementById("remix-output");
const savedRecipesList = document.getElementById("saved-recipes-list");

let currentRecipeData = null;

async function fetchAndDisplayRandomRecipe() {
  recipeDisplay.innerHTML = "<p>Loading...</p>";
  remixOutput.textContent = "";
  try {
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const data = await res.json();
    currentRecipeData = data;

    const recipe = data.meals[0];
    let ingHtml = "";
    for (let i = 1; i <= 20; i++) {
      const ing = recipe[`strIngredient${i}`];
      const meas = recipe[`strMeasure${i}`];
      if (ing && ing.trim()) ingHtml += `<li>${meas ? `${meas} ` : ""}${ing}</li>`;
    }

    recipeDisplay.innerHTML = `
      <h2>${recipe.strMeal}</h2>
      <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" />
      <h3>Ingredients:</h3>
      <ul>${ingHtml}</ul>
      <h3>Instructions:</h3>
      <p>${recipe.strInstructions.replace(/\r?\n/g, "<br>")}</p>
      <button id="save-recipe-btn" class="accent-btn save-inline-btn" style="margin-top:18px;">Save Recipe</button>
    `;

    document.getElementById("save-recipe-btn").onclick = () => {
      let saved = JSON.parse(localStorage.getItem("savedRecipes") || "[]");
      saved.push(recipe.strMeal);
      localStorage.setItem("savedRecipes", JSON.stringify(saved));
      showSavedRecipes();
    };
  } catch (error) {
    recipeDisplay.innerHTML = "<p>Sorry, couldn't load a recipe.</p>";
  }
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

  try {
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
    remixOutput.textContent = data.choices[0].message.content;
  } catch (error) {
    remixOutput.textContent = "Sorry, something went wrong remixing the recipe.";
  }
}

function showSavedRecipes() {
  // Get saved recipe names from localStorage
  let saved = JSON.parse(localStorage.getItem("savedRecipes") || "[]");
  // Show or hide the saved recipes container based on if there are any saved recipes
  const savedRecipesContainer = document.getElementById("saved-recipes-container");
  if (saved.length === 0) {
    savedRecipesContainer.style.display = "none";
    return;
  } else {
    savedRecipesContainer.style.display = "";
  }

  savedRecipesList.innerHTML = "";

  saved.forEach((name, idx) => {
    const li = document.createElement("li");
    li.className = "saved-recipe-item";

    // Create a clickable span for the recipe name
    const span = document.createElement("span");
    span.textContent = name;
    span.style.cursor = "pointer";
    span.title = "Click to view this recipe";

    // When the recipe name is clicked, fetch and display it
    span.onclick = async () => {
      recipeDisplay.innerHTML = "<p>Loading...</p>";
      remixOutput.textContent = "";
      try {
        // Fetch recipe by name from TheMealDB API
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`);
        const data = await res.json();
        if (!data.meals || data.meals.length === 0) {
          recipeDisplay.innerHTML = "<p>Recipe not found.</p>";
          return;
        }
        currentRecipeData = data;
        const recipe = data.meals[0];

        // Build ingredients list
        let ingHtml = "";
        for (let i = 1; i <= 20; i++) {
          const ing = recipe[`strIngredient${i}`];
          const meas = recipe[`strMeasure${i}`];
          if (ing && ing.trim()) ingHtml += `<li>${meas ? `${meas} ` : ""}${ing}</li>`;
        }

        // Show the recipe
        recipeDisplay.innerHTML = `
          <div class="recipe-title-row">
            <h2>${recipe.strMeal}</h2>
          </div>
          <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" />
          <h3>Ingredients:</h3>
          <ul>${ingHtml}</ul>
          <h3>Instructions:</h3>
          <p>${recipe.strInstructions.replace(/\r?\n/g, "<br>")}</p>
          <button id="save-recipe-btn" class="accent-btn save-inline-btn" style="margin-top:18px;">Save Recipe</button>
        `;

        // Add event listener to Save button (to allow re-saving if needed)
        document.getElementById("save-recipe-btn").onclick = () => {
          let saved = JSON.parse(localStorage.getItem("savedRecipes") || "[]");
          if (!saved.includes(recipe.strMeal)) {
            saved.push(recipe.strMeal);
            localStorage.setItem("savedRecipes", JSON.stringify(saved));
            showSavedRecipes();
          }
        };
      } catch (error) {
        recipeDisplay.innerHTML = "<p>Sorry, couldn't load this recipe.</p>";
      }
    };

    // Delete button for removing the recipe from saved list
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete-btn";
    delBtn.onclick = () => {
      saved.splice(idx, 1);
      localStorage.setItem("savedRecipes", JSON.stringify(saved));
      showSavedRecipes();
    };

    li.appendChild(span);
    li.appendChild(delBtn);
    savedRecipesList.appendChild(li);
  });
}

randomBtn.onclick = fetchAndDisplayRandomRecipe;
remixBtn.onclick = remixRecipe;

document.addEventListener("DOMContentLoaded", () => {
  fetchAndDisplayRandomRecipe();
  showSavedRecipes();
});
