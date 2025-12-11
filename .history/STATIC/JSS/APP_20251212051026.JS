let allRecipes = []; // to store all recipes from backend

async function loadRecipes() {
    const res = await fetch("/api/recipes");
    const recipes = await res.json();
    allRecipes = recipes; // save globally
    renderRecipes(recipes); // show all initially
}

