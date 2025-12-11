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
// helper for favorites
function loadFavorites() {
    const raw = localStorage.getItem("favorites");
    return raw ? JSON.parse(raw) : [];
}
function saveFavorites(list) {
    localStorage.setItem("favorites", JSON.stringify(list));
}

function isFavorite(id) {
    const fav = loadFavorites();
    return fav.includes(id);
}
function toggleFavorite(id, buttonEl) {
    const fav = loadFavorites();
    if (fav.includes(id)) {
        const idx = fav.indexOf(id);
        fav.splice(idx, 1);
        buttonEl.classList.remove("favorite-on");
    } else {
        fav.push(id);
        buttonEl.classList.add("favorite-on");
    }
    saveFavorites(fav);
}

// modify render to include favorite and missing-ingredients
function renderRecipes(recipes) {
    const container = document.getElementById("recipes-container");
    container.innerHTML = "";

    if (recipes.length === 0) {
        container.innerHTML = "<p>No recipes found for selected ingredients.</p>";
        return;
    }

    const selected = getSelectedIngredients();

    recipes.forEach(recipe => {
        const card = document.createElement("div");
        card.className = "recipe-card";

        const missing = recipe.ingredients.filter(i => !selected.includes(i));
        const missingText = selected.length === 0 ? "" : `<p class="small"><b>Missing:</b> ${missing.join(", ") || "None"}</p>`;

        const favHtml = `<button class="favorite-btn ${isFavorite(recipe.id) ? "favorite-on" : ""}" data-id="${recipe.id}">♥</button>`;

        card.innerHTML = `
            <img src="${recipe.image || '/static/images/placeholder.png'}" alt="${recipe.name}" />
            <div class="recipe-content">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2 class="recipe-title">${recipe.name}</h2>
                ${favHtml}
              </div>
              <p class="small"><b>Ingredients:</b> ${recipe.ingredients.join(", ")}</p>
              ${missingText}
              <p class="small"><b>Calories:</b> ${recipe.calories}</p>
            </div>
        `;

        // attach fav toggle
        container.appendChild(card);
        const btn = card.querySelector(".favorite-btn");
        btn.addEventListener("click", (e) => {
            toggleFavorite(recipe.id, e.currentTarget);
        });
    });
}
