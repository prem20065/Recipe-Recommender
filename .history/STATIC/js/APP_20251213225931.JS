// ===============================
// GLOBAL STATE
// ===============================
let allRecipes = [];

// ===============================
// LOAD RECIPES FROM BACKEND
// ===============================
async function loadRecipes() {
    try {
        const res = await fetch("/api/recipes");
        const recipes = await res.json();
        allRecipes = recipes;
        renderRecipes(recipes);
    } catch (err) {
        console.error("Error loading recipes:", err);
    }
}

// ===============================
// RENDER RECIPES
// ===============================
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
        const missingText =
            selected.length === 0
                ? ""
                : `<p class="small"><b>Missing:</b> ${missing.join(", ") || "None"}</p>`;

        const favHtml = `
            <button class="favorite-btn ${isFavorite(recipe.id) ? "favorite-on" : ""}">
                ♥
            </button>
        `;

        card.innerHTML = `
            <img src="${recipe.image || '/static/images/placeholder.png'}" alt="${recipe.name}">
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

        // open modal on card click
        card.addEventListener("click", () => openModal(recipe));

        // favorite button (prevent modal opening)
        const favBtn = card.querySelector(".favorite-btn");
        favBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleFavorite(recipe.id, favBtn);
        });
    });
}

// ===============================
// FILTER LOGIC
// ===============================
function getSelectedIngredients() {
    const checkboxes = document.querySelectorAll(
        "#ingredients-list input[type='checkbox']:checked"
    );
    return Array.from(checkboxes).map(cb => cb.value);
}

function getSearchQuery() {
    return document.getElementById("search-input").value.trim().toLowerCase();
}

function filterRecipes() {
    const selected = getSelectedIngredients();
    const query = getSearchQuery();

    const filtered = allRecipes.filter(recipe => {
        const ingredientMatch =
            selected.length === 0 ||
            selected.every(i => recipe.ingredients.includes(i));

        const nameMatch =
            query === "" ||
            recipe.name.toLowerCase().includes(query);

        return ingredientMatch && nameMatch;
    });

    renderRecipes(filtered);
}

function clearFilters() {
    document
        .querySelectorAll("#ingredients-list input[type='checkbox']")
        .forEach(cb => cb.checked = false);

    document.getElementById("search-input").value = "";
    renderRecipes(allRecipes);
}

// ===============================
// FAVORITES (LOCAL STORAGE)
// ===============================
function loadFavorites() {
    return JSON.parse(localStorage.getItem("favorites") || "[]");
}

function saveFavorites(list) {
    localStorage.setItem("favorites", JSON.stringify(list));
}

function isFavorite(id) {
    return loadFavorites().includes(id);
}

function toggleFavorite(id, btn) {
    let favs = loadFavorites();

    if (favs.includes(id)) {
        favs = favs.filter(f => f !== id);
        btn.classList.remove("favorite-on");
    } else {
        favs.push(id);
        btn.classList.add("favorite-on");
    }

    saveFavorites(favs);
}

// ===============================
// MODAL (RECIPE DETAILS)
// ===============================
const modal = document.getElementById("recipe-modal");
const closeModalBtn = document.getElementById("close-modal");

function openModal(recipe) {
    const modal = document.getElementById("recipe-modal");
    if (!modal) return;

    document.getElementById("modal-title").innerText = recipe.name;
    document.getElementById("modal-ingredients").innerHTML =
        "<b>Ingredients:</b> " + recipe.ingredients.join(", ");
    document.getElementById("modal-steps").innerHTML =
        "<b>Steps:</b> " + recipe.steps;
    document.getElementById("modal-calories").innerHTML =
        "<b>Calories:</b> " + recipe.calories;

    modal.classList.remove("hidden");
}


window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.add("hidden");
    }
});

// ===============================
// INIT
// ===============================
window.addEventListener("DOMContentLoaded", () => {

    // load recipes
    loadRecipes();

    // safe button bindings
    const filterBtn = document.getElementById("filter-btn");
    const clearBtn = document.getElementById("clear-btn");
    const searchInput = document.getElementById("search-input");

    if (filterBtn) {
        filterBtn.addEventListener("click", filterRecipes);
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", clearFilters);
    }

    if (searchInput) {
        searchInput.addEventListener("input", filterRecipes);
    }

    // modal elements (SAFE)
    const modal = document.getElementById("recipe-modal");
    const closeModalBtn = document.getElementById("close-modal");

    if (modal && closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            modal.classList.add("hidden");
        });

        window.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.add("hidden");
            }
        });
    }
});

