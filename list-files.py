path = "./public/music/Original Soundtracks/"

import os

# walk the directory
for root, dirs, files in os.walk(path):
    for file in files:
        f = os.path.join(root, file)
        # remove path
        f = f.replace(path, "")
        # replace "\" with "/"
        f = f.replace("\\", "/")
        print(f)

