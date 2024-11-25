import os

path1 = "cards"
path2 = "cards-zun"

if __name__ == "__main__":
    r1 = os.listdir(path1)
    r2 = os.listdir(path2)
    r1 = sorted(r1)
    r2 = sorted(r2)
    for filename in r1:
        if filename not in r2:
            print(f"{filename} not found in {path2}")
    for filename in r2:
        if filename not in r1:
            print(f"{filename} not found in {path1}")