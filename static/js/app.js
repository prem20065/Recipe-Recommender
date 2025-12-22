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
  recipeContainer.innerHTML = "";

  recipes.forEach(r => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    card.innerHTML = `
      <img src="${r.image}" alt="${r.name}" />
      <h3>${r.name}</h3>
      <p>Recommended based on your ingredients</p>
    `;

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
        // Smart Ranking Algorithm
        const selected = getSelectedIngredients();
        const missing = selected.filter(i => !recipe.ingredients.includes(i));
        const missingCount = missing.length;
        
        // Ingredient match percentage (0-100)
        const matchPercent = selected.length === 0 
            ? 50 
            : ((selected.length - missingCount) / selected.length) * 100;
        
        // Popularity score (based on views + favorites)
        const analytics = getAnalytics();
        const views = analytics.recipe_views?.[recipe.id] || 0;
        const favCount = analytics.favorites?.[recipe.id] || 0;
        const popularity = (views * 0.7) + (favCount * 2);
        
        // Engagement rate (favorites / views)
        const engagementRate = views > 0 ? (favCount / views) * 100 : 0;
        
        // Combined score: prioritize match%, then popularity, then engagement
        const score = (missingCount * 1000) - (matchPercent * 10) - popularity - engagementRate;

        return { 
            ...recipe, 
            score, 
            matchPercent: Math.round(matchPercent),
            popularity,
            engagement: Math.round(engagementRate)
        };
    })
    .filter(recipe => {
        const query = getSearchQuery();
        return query === "" || recipe.name.toLowerCase().includes(query);
    })
    .sort((a, b) => a.score - b.score); // best match first

    renderRecipes(filtered);
    updateStats();
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
    updateStats();
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
        searchInput.addEventListener("input", filterRecipes);
    }
const themeToggle = document.getElementById("theme-toggle");

if (themeToggle) {
    // load saved theme
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        themeToggle.innerText = "☀️ Light Mode";
    }

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {
            localStorage.setItem("theme", "dark");
            themeToggle.innerText = "☀️ Light Mode";
        } else {
            localStorage.setItem("theme", "light");
            themeToggle.innerText = "🌙 Dark Mode";
        }
    });
}

    // modal elements (SAFE)
    const modal = document.getElementById("recipe-modal");
    const closeModalBtn = document.getElementById("close-modal");

    if (modal && closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            modal.classList.add("hidden");
        });
    }
    
    if (modal) {
        window.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.add("hidden");
            }
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
        .map(([ing, count]) => ing)
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

document.getElementById("nlSearchBtn").addEventListener("click", async () => {
  const query = document.getElementById("nlQuery").value;

  if (!query.trim()) return;

  const res = await fetch("/api/nl-recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });

  const data = await res.json();
  renderRecipes(data);
});
fetch("/api/semantic-search", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({ query: "quick spicy vegetarian dinner" })
})
.then(res => res.json())
.then(console.log)
