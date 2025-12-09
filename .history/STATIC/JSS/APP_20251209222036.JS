async function loadRecipes() {
    const res = await fetch("/api/recipes");
    const recipes = await res.json();

    const container = document.getElementById("recipes-container");

    container.innerHTML = ""; // clear old content

    recipes.forEach(recipe => {
        const card = `
        <div class="recipe-card">
            <h2>${recipe.name}</h2>
            <p><b>Ingredients:</b> ${recipe.ingredients.join(", ")}</p>
            <p><b>Calories:</b> ${recipe.calories}</p>
        </div>
        `;
        container.innerHTML += card;
    });
}

loadRecipes();
