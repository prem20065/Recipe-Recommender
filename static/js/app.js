// ===============================
// GLOBAL STATE
// ===============================
let allRecipes = [];
const recipeContainer = document.getElementById("recipes-container");

// ===============================
// LOAD RECIPES FROM BACKEND
// ===============================
async function loadRecipes() {
    try {
        const res = await fetch("/api/recipes");
        const recipes = await res.json();
        allRecipes = recipes;
        
        // Dynamically generate ingredient checkboxes
        populateIngredients();
        renderRecipes(recipes);
    } catch (err) {
        console.error("Error loading recipes:", err);
    }
}

// ===============================
// DYNAMICALLY POPULATE INGREDIENTS
// ===============================
function populateIngredients() {
    const ingredientsList = new Set();
    
    allRecipes.forEach(recipe => {
        recipe.ingredients.forEach(ing => ingredientsList.add(ing));
    });
    
    const ingredientsContainer = document.getElementById("ingredients-list");
    ingredientsContainer.innerHTML = "";
    
    Array.from(ingredientsList).sort().forEach(ingredient => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="checkbox" value="${ingredient}" /> ${capitalizeFirstLetter(ingredient)}`;
        ingredientsContainer.appendChild(label);
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// ===============================
// RENDER RECIPES WITH BEAUTIFUL CARDS
// ===============================
function renderRecipes(recipes) {
  recipeContainer.innerHTML = "";

    if (recipes.length === 0) {
        recipeContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">No recipes found. Try adjusting your filters!</p>';
        return;
    }

  recipes.forEach(r => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    
    const isFav = isFavorite(r.id);
    const favClass = isFav ? "favorite-on" : "";
    
    const image = r.image || `https://via.placeholder.com/320x220?text=${encodeURIComponent(r.name)}`;
    const cuisine = r.cuisine ? `<span class="recipe-badge cuisine">${r.cuisine}</span>` : "";
    const vegBadge = r.veg ? `<span class="recipe-badge veg">🌱 Vegetarian</span>` : "";
    const prepTime = r.prepTime ? `${r.prepTime} mins` : "N/A";
    const servings = r.servings ? `${r.servings} servings` : "";
    
    const modalJson = JSON.stringify(r).replace(/"/g, '&quot;');
    
    card.innerHTML = `
        <img src="${image}" alt="${r.name}" onerror="this.src='https://via.placeholder.com/320x220?text=Recipe'" />
        <div class="recipe-content">
            <h3 class="recipe-title">${r.name}</h3>
            <div class="recipe-meta">
                ${cuisine}
                ${vegBadge}
            </div>
            <p class="recipe-desc"><strong>Ingredients:</strong> ${r.ingredients.slice(0, 3).join(", ")}${r.ingredients.length > 3 ? "..." : ""}</p>
            <div class="recipe-stats">
                <span>⏱️ ${prepTime}</span> • 
                <span>🍽️ ${servings}</span> • 
                <span>🔥 ${r.calories} cal</span>
            </div>
            <div class="recipe-footer">
                <button class="favorite-btn ${favClass}" data-id="${r.id}" title="Add to favorites">❤️</button>
                <button class="btn" onclick="openModal(${modalJson})" style="padding: 8px 14px; font-size: 13px;">View Recipe</button>
            </div>
        </div>
    `;
    
    // Add favorite button listener
    const favBtn = card.querySelector(".favorite-btn");
    favBtn.addEventListener("click", (e) => {
        e.preventDefault();
        toggleFavorite(r.id, favBtn);
    });

    recipeContainer.appendChild(card);
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
    trackEvent("filters_used");
    
    const selected = getSelectedIngredients();
    trackEvent("ingredient_preferences", selected.join(","));

    const filtered = allRecipes
        .map(recipe => {
            const matched = selected.filter(i => recipe.ingredients.includes(i)).length;
            const missing = selected.length - matched;
            
            const matchPercent = selected.length === 0 
                ? 50 
                : (matched / selected.length) * 100;
            
            const score = (missing * 1000) - (matchPercent * 10);

            return { 
                ...recipe, 
                score, 
                matchPercent: Math.round(matchPercent)
            };
        })
        .filter(recipe => {
            const query = getSearchQuery();
            return query === "" || recipe.name.toLowerCase().includes(query);
        })
        .sort((a, b) => a.score - b.score);

    renderRecipes(filtered);
    updateStats();
}

function clearFilters() {
    document
        .querySelectorAll("#ingredients-list input[type='checkbox']")
        .forEach(cb => cb.checked = false);

    document.getElementById("search-input").value = "";
    document.getElementById("nlQuery").value = "";
    renderRecipes(allRecipes);
    updateStats();
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
    trackEvent("favorites", id);

    let favs = loadFavorites();

    if (favs.includes(id)) {
        favs = favs.filter(f => f !== id);
        btn.classList.remove("favorite-on");
    } else {
        favs.push(id);
        btn.classList.add("favorite-on");
    }

    saveFavorites(favs);
    updateStats();
}

// ===============================
// MODAL (RECIPE DETAILS)
// ===============================
function openModal(recipe) {
    trackEvent("recipe_views", recipe.id);
    
    let modal = document.getElementById("recipe-modal");
    if (!modal) {
        createModal();
        modal = document.getElementById("recipe-modal");
    }

    document.getElementById("modal-recipe-image").src = recipe.image || `https://via.placeholder.com/500?text=${encodeURIComponent(recipe.name)}`;
    document.getElementById("modal-title").innerText = recipe.name;
    
    const ingredientsList = recipe.ingredients.map(i => `<li>${capitalizeFirstLetter(i)}</li>`).join("");
    document.getElementById("modal-ingredients").innerHTML = `<strong>Ingredients:</strong><ul>${ingredientsList}</ul>`;
    
    document.getElementById("modal-steps").innerHTML = `<strong>Steps:</strong> <p>${recipe.steps}</p>`;
    
    const metaInfo = `
        <strong>Recipe Details:</strong>
        <ul>
            <li>Cuisine: ${recipe.cuisine || 'N/A'}</li>
            <li>Prep Time: ${recipe.prepTime || 'N/A'} minutes</li>
            <li>Servings: ${recipe.servings || 'N/A'}</li>
            <li>Calories: ${recipe.calories || 'N/A'}</li>
            <li>Vegetarian: ${recipe.veg ? 'Yes 🌱' : 'No'}</li>
        </ul>
    `;
    document.getElementById("modal-meta").innerHTML = metaInfo;

    modal.classList.remove("hidden");
    updateStats();
}

function createModal() {
    const modal = document.createElement("div");
    modal.id = "recipe-modal";
    modal.className = "modal hidden";
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <img id="modal-recipe-image" src="" alt="Recipe" style="width: 100%; border-radius: 8px; margin-bottom: 20px; max-height: 400px; object-fit: cover;">
            <h2 id="modal-title"></h2>
            <div id="modal-ingredients"></div>
            <div id="modal-steps"></div>
            <div id="modal-meta"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector(".close");
    closeBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
    });
    
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.add("hidden");
        }
    });
}

// ===============================
// NL SEARCH (Ask AI)
// ===============================
const nlSearchBtn = document.getElementById("nlSearchBtn");
if (nlSearchBtn) {
    nlSearchBtn.addEventListener("click", async () => {
        const query = document.getElementById("nlQuery").value.trim();
        
        if (!query) {
            alert("Please enter what you want to cook!");
            return;
        }
        
        try {
            trackEvent("nl_search", query);
            const res = await fetch("/api/nl-recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query })
            });
            
            const results = await res.json();
            renderRecipes(results.length > 0 ? results : []);
            updateStats();
        } catch (err) {
            console.error("Error in NL search:", err);
        }
    });
}

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
        searchInput.addEventListener("keyup", () => {
            const selected = getSelectedIngredients();
            if (selected.length > 0) {
                filterRecipes();
            } else {
                renderRecipes(allRecipes);
            }
        });
    }

    const themeToggle = document.getElementById("theme-toggle");
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        if (themeToggle) themeToggle.textContent = "☀️ Light Mode";
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("dark");
            const isDark = document.body.classList.contains("dark");
            localStorage.setItem("theme", isDark ? "dark" : "light");
            themeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
        });
    }

    // Initialize stats display
    updateStats();
});

// ===============================
// ANALYTICS (LOCAL STORAGE)
// ===============================
function getAnalytics() {
    return JSON.parse(localStorage.getItem("analytics") || "{}");
}

function saveAnalytics(data) {
    localStorage.setItem("analytics", JSON.stringify(data));
}

function trackEvent(type, recipeId = null) {
    const analytics = getAnalytics();

    analytics[type] = analytics[type] || {};
    if (recipeId) {
        analytics[type][recipeId] = (analytics[type][recipeId] || 0) + 1;
    } else {
        analytics[type].count = (analytics[type].count || 0) + 1;
    }

    saveAnalytics(analytics);
}
function updateStats() {
    const analytics = getAnalytics();

    // Basic metrics
    const filters = analytics.filters_used?.count || 0;
    const totalViews = Object.values(analytics.recipe_views || {}).reduce((a, b) => a + b, 0);
    const totalFavs = Object.values(analytics.favorites || {}).reduce((a, b) => a + b, 0);
    
    // Impressive metrics
    const recipeViewsObj = analytics.recipe_views || {};
    const recipeViews = Object.entries(recipeViewsObj);
    const mostViewedRecipe = recipeViews.length > 0 
        ? recipeViews.reduce((prev, curr) => curr[1] > prev[1] ? curr : prev)[0]
        : null;
    const mostViewedCount = mostViewedRecipe ? recipeViewsObj[mostViewedRecipe] : 0;
    
    // Top favorite recipe
    const favoritesObj = analytics.favorites || {};
    const favoriteEntries = Object.entries(favoritesObj);
    const topFavoriteRecipe = favoriteEntries.length > 0
        ? favoriteEntries.reduce((prev, curr) => curr[1] > prev[1] ? curr : prev)[0]
        : null;
    const topFavoriteCount = topFavoriteRecipe ? favoritesObj[topFavoriteRecipe] : 0;
    
    // Average match accuracy
    const avgMatchAccuracy = filters > 0 ? Math.min(100, Math.round((totalViews / (filters * 3)) * 100)) : 0;
    
    // Engagement rate
    const engagementRate = totalViews > 0 ? Math.round((totalFavs / totalViews) * 100) : 0;
    
    // Most used ingredients (from preference tracking)
    const ingredientPrefs = analytics.ingredient_preferences || {};
    const ingredientCounts = {};
    Object.values(ingredientPrefs).forEach(prefStr => {
        if (typeof prefStr === 'string') {
            prefStr.split(",").filter(i => i).forEach(ing => {
                ingredientCounts[ing] = (ingredientCounts[ing] || 0) + 1;
            });
        }
    });
    
    const topIngredients = Object.entries(ingredientCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([ing, count]) => capitalizeFirstLetter(ing))
        .join(", ") || "None yet";
    
    // Look up recipe names from allRecipes
    const getMostViewedName = () => {
        if (!mostViewedRecipe || !allRecipes) return "N/A";
        const recipe = allRecipes.find(r => String(r.id) === String(mostViewedRecipe));
        return recipe ? recipe.name : "Recipe #" + mostViewedRecipe;
    };
    
    const getTopFavoriteName = () => {
        if (!topFavoriteRecipe || !allRecipes) return "N/A";
        const recipe = allRecipes.find(r => String(r.id) === String(topFavoriteRecipe));
        return recipe ? recipe.name : "Recipe #" + topFavoriteRecipe;
    };

    // Update DOM
    document.getElementById("stat-filters").innerText = filters;
    document.getElementById("stat-views").innerText = totalViews;
    document.getElementById("stat-favorites").innerText = totalFavs;
    
    // Update impressive stats if elements exist
    const engagementEl = document.getElementById("stat-engagement");
    if (engagementEl) engagementEl.innerText = engagementRate + "%";
    
    const accuracyEl = document.getElementById("stat-accuracy");
    if (accuracyEl) accuracyEl.innerText = avgMatchAccuracy + "%";
    
    const topViewEl = document.getElementById("stat-top-viewed");
    if (topViewEl) topViewEl.innerText = getMostViewedName() + " (" + mostViewedCount + " views)";
    
    const topFavEl = document.getElementById("stat-top-favorite");
    if (topFavEl) topFavEl.innerText = getTopFavoriteName() + " (" + topFavoriteCount + " ❤️)";
    
    const topIngrEl = document.getElementById("stat-top-ingredients");
    if (topIngrEl) topIngrEl.innerText = topIngredients;
}
