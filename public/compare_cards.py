import os

path1 = "cards"
path2 = "cards-thwiki"

if __name__ == "__main__":
    for filename in os.listdir(path1):
        if filename not in os.listdir(path2):
            print(f"{filename} not found in {path2}")
    for filename in os.listdir(path2):
        if filename not in os.listdir(path1):
            print(f"{filename} not found in {path1}")