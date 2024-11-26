import os

path = "./cards-dairi-original/"

def rename_file(filename):
    nf = filename
    if nf.endswith(".png"):
        nf = nf[:-4]
    if nf.endswith("（余裕）"):
        nf = nf[:-4]
    if nf.endswith("（微笑）"):
        nf = nf[:-4]
    if nf.endswith("（余裕1）"):
        nf = nf[:-5]
    if nf.endswith("（普通）"):
        nf = nf[:-4]
    if nf.endswith("（笑い）"):
        nf = nf[:-4]
    nf = nf + ".png"
    return nf

if __name__ == "__main__":
    for filename in os.listdir(path):
        new_filename = rename_file(filename)
        os.rename(os.path.join(path, filename), os.path.join(path, new_filename))
        print(f"Renamed {filename} to {new_filename}")