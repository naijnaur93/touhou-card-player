import os
from PIL import Image

original_resolution = (703, 1000)
new_resolution = (351, 500)
original_extension = ".png"
new_extension = ".webp"
path = "./public/cards/"
new_path = "./public/original_cards/"

def convert_file(filename):
    input_filename = os.path.join(path, filename)
    img = Image.open(input_filename)
    assert(img.size == original_resolution)
    img = img.resize(new_resolution)
    new_filename = os.path.splitext(filename)[0] + new_extension
    output_filename = os.path.join(new_path, new_filename)
    img.save(output_filename, "WEBP")

if __name__ == "__main__":
    # rename path to backup_path
    assert(os.path.exists(path))
    os.makedirs(new_path, exist_ok=True)
    
    # convert all files
    for filename in os.listdir(path):
        if filename.endswith(original_extension):
            convert_file(filename)
            print(f"Converted {filename}")