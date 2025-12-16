import os
import shutil

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
templates_images = os.path.join(BASE_DIR, 'templates', 'images')
static_images = os.path.join(BASE_DIR, 'static', 'images')

os.makedirs(static_images, exist_ok=True)

moves = [
    ('tomato egg stir fry.jpg', 'tomato-egg-stir-fry.jpg'),
    ('veg-fried-rice.jpg', 'veg-fried-rice.jpg'),
    ('masala maggi.jpg', 'masala-maggi.jpg'),
]

moved = []
for src_name, dst_name in moves:
    src = os.path.join(templates_images, src_name)
    dst = os.path.join(static_images, dst_name)
    if os.path.exists(src):
        try:
            shutil.move(src, dst)
            moved.append((src, dst))
        except Exception as e:
            print(f"Failed to move {src}: {e}")
    else:
        print(f"Source not found: {src}")

if moved:
    print('Moved files:')
    for s,d in moved:
        print(f' - {s} -> {d}')
else:
    print('No files moved')
