import os
import json
from flask import Flask, render_template, jsonify

# Get absolute path to app directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, 
           template_folder=os.path.join(BASE_DIR, 'templates'),
           static_folder=os.path.join(BASE_DIR, 'static'))

def load_recipes():
    """Load recipes from JSON file"""
    recipe_file = os.path.join(BASE_DIR, 'recipes.json')
    try:
        with open(recipe_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading recipes: {e}")
        return []

@app.route('/')
def home():
    """Serve home page"""
    return render_template('index.html')

@app.route('/api/recipes')
def get_recipes():
    """API endpoint to get all recipes"""
    recipes = load_recipes()
    return jsonify(recipes)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
