// ---------------------------
// GLOBAL DATA
// ---------------------------
let allRecipes = []; // store all recipes from backend

// ---------------------------
// LOAD RECIPES FROM BACKEND
// ---------------------------
async function loadRecipes() {
    try {
        const res = await fetch("/api/recipes");
        const recipes = await res.json();
        allRecipes = recipes;
        renderRecipes(recipes); // show all initially
    } catch (err) {
        console.error("Failed to load recipes:", err);
    }
}

// ---------------------------
// RENDER RECIPES TO UI
// ---------------------------
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

        // missing ingredients for UX
        const missing = recipe.ingredients.filter(i => !selected.includes(i));
        const missingText =
            selected.length === 0
                ? ""
                : `<p class="small"><b>Missing:</b> ${missing.join(", ") || "None"}</p>`;

        // Favorites button
        const favHtml = `
            <button class="favorite-btn ${isFavorite(recipe.id) ? "favorite-on" : ""}"
            data-id="${recipe.id}">♥</button>
        `;

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

        container.appendChild(card);

        // Attach favorite toggle listener
        const btn = card.querySelector(".favorite-btn");
        btn.addEventListener("click", (e) => toggleFavorite(recipe.id, e.currentTarget));
    });
}

// ---------------------------
// GET SELECTED INGREDIENTS
// ---------------------------
function getSelectedIngredients() {
    const checkboxes = document.querySelectorAll(
        "#ingredients-list input[type='checkbox']:checked"
    );
    const selected = [];
    checkboxes.forEach(cb => selected.push(cb.value));
    return selected;
}

// ---------------------------
// CLEAR FILTERS
// ---------------------------
function clearFilters() {
    // uncheck all checkboxes
    const checkboxes = document.querySelectorAll("#ingredients-list input[type='checkbox']");
    checkboxes.forEach(cb => (cb.checked = false));

    // reset search box
    document.getElementById("search-input").value = "";

    // render all recipes again
    renderRecipes(allRecipes);
}

// ---------------------------
// GET SEARCH QUERY
// ---------------------------
function getSearchQuery() {
    return document.getElementById("search-input").value.trim().toLowerCase();
}

// ---------------------------
// APPLY FILTERS (ingredients + search)
// ---------------------------
function filterRecipes() {
    const selected = getSelectedIngredients();
    const q = getSearchQuery();

    let filtered = allRecipes.filter(recipe => {
        const ingOk =
            selected.length === 0 ||
            selected.every(ing => recipe.ingredients.includes(ing));

        const nameOk =
            q === "" || recipe.name.toLowerCase().includes(q);

        return ingOk && nameOk;
    });

    renderRecipes(filtered);
}

// ---------------------------
// FAVORITES SYSTEM
// ---------------------------
function loadFavorites() {
    const raw = localStorage.getItem("favorites");
    return raw ? JSON.parse(raw) : [];
}

function saveFavorites(list) {
    localStorage.setItem("favorites", JSON.stringify(list));
}

function isFavorite(id) {
    return loadFavorites().includes(id);
}

function toggleFavorite(id, buttonEl) {
    const fav = loadFavorites();

    if (fav.includes(id)) {
        // remove from favorites
        fav.splice(fav.indexOf(id), 1);
        buttonEl.classList.remove("favorite-on");
    } else {
        // add to favorites
        fav.push(id);
        buttonEl.classList.add("favorite-on");
    }

    saveFavorites(fav);
}

// ---------------------------
// EVENT LISTENERS (RUN ON PAGE LOAD)
// ---------------------------
window.addEventListener("DOMContentLoaded", () => {
    loadRecipes(); // load recipes on page load

    document.getElementById("filter-btn").addEventListener("click", filterRecipes);
    document.getElementById("clear-btn").addEventListener("click", clearFilters);

    // live search
    document.getElementById("search-input").addEventListener("input", filterRecipes);
});
