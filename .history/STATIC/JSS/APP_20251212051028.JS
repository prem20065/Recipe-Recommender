let allRecipes = []; // to store all recipes from backend

async function loadRecipes() {
    const res = await fetch("/api/recipes");
    const recipes = await res.json();
    allRecipes = recipes; // save globally
    renderRecipes(recipes); // show all initially
}

function renderRecipes(recipes) {
    const container = document.getElementById("recipes-container");
    container.innerHTML = "";

    if (recipes.length === 0) {
        container.innerHTML = "<p>No recipes found for selected ingredients.</p>";
        return;
    }

    recipes.forEach(recipe => {
        const card = document.createElement("div");
        card.className = "recipe-card";

        const imageURL = recipe.image || "/static/images/placeholder.png"; // add placeholder image file
        card.innerHTML = `
            <img src="${imageURL}" alt="${recipe.name}" />
            <div class="recipe-content">
              <h2 class="recipe-title">${recipe.name}</h2>
              <p class="small"><b>Ingredients:</b> ${recipe.ingredients.join(", ")}</p>
              <p class="small"><b>Calories:</b> ${recipe.calories}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// add search integration
function getSearchQuery() {
    return document.getElementById("search-input").value.trim().toLowerCase();
}

function filterRecipes() {
    const selected = getSelectedIngredients();
    const q = getSearchQuery();

    let filtered = allRecipes.filter(recipe => {
        // ingredient match
        const ingOk = selected.length === 0 || selected.every(ing => recipe.ingredients.includes(ing));
        // search match
        const nameOk = q === "" || recipe.name.toLowerCase().includes(q);
        return ingOk && nameOk;
    });

    renderRecipes(filtered);
}

// attach search enter + live search (optional)
window.addEventListener("DOMContentLoaded", () => {
    loadRecipes();
    document.getElementById("filter-btn").addEventListener("click", filterRecipes);
    document.getElementById("clear-btn").addEventListener("click", clearFilters);
    document.getElementById("search-input").addEventListener("input", filterRecipes);
});
