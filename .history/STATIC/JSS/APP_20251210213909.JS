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

        card.innerHTML = `
            <h2>${recipe.name}</h2>
            <p><b>Ingredients:</b> ${recipe.ingredients.join(", ")}</p>
            <p><b>Calories:</b> ${recipe.calories}</p>
        `;

        container.appendChild(card);
    });
}

function getSelectedIngredients() {
    const checkboxes = document.querySelectorAll("#ingredients-list input[type='checkbox']:checked");
    const selected = [];
    checkboxes.forEach(cb => selected.push(cb.value));
    return selected;
}

function filterRecipes() {
    const selected = getSelectedIngredients();

    if (selected.length === 0) {
        // if nothing selected, show all
        renderRecipes(allRecipes);
        return;
    }

    const filtered = allRecipes.filter(recipe => {
        // check if all selected ingredients are present in recipe.ingredients
        return selected.every(ing => recipe.ingredients.includes(ing));
    });

    renderRecipes(filtered);
}

function clearFilters() {
    const checkboxes = document.querySelectorAll("#ingredients-list input[type='checkbox']");
    checkboxes.forEach(cb => cb.checked = false);
    renderRecipes(allRecipes);
}

// attach event listeners once DOM is ready
window.addEventListener("DOMContentLoaded", () => {
    loadRecipes();

    document.getElementById("filter-btn").addEventListener("click", filterRecipes);
    document.getElementById("clear-btn").addEventListener("click", clearFilters);
});
