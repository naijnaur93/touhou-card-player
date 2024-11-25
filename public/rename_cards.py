import os

path = "./cards-thwiki/"

def rename_file(filename):
    nf = filename
    if nf.endswith(".png"):
        nf = nf[:-4]
    if nf.endswith("（Q版立绘）"):
        nf = nf[:-6]
    nf = nf + ".png"
    return nf

if __name__ == "__main__":
    for filename in os.listdir(path):
        new_filename = rename_file(filename)
        os.rename(os.path.join(path, filename), os.path.join(path, new_filename))
        print(f"Renamed {filename} to {new_filename}")