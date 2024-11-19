filename = "./public/download-list.txt"

if __name__ == "__main__":
    lines = []
    with open(filename, "r", encoding="utf-8") as f:
        lines = f.readlines()
    lines = [line.strip() for line in lines]
    lines = [line for line in lines if line != ""]
    d = {}
    for i in range(0, len(lines), 2):
        d[lines[i]] = lines[i+1]
    print("{")
    for i, (key, value) in enumerate(d.items()):
        print('    "{key}": "{value}"'.format(key=key, value=value), end="")
        if i != len(d) - 1:
            print(",")
        else:
            print()
    print("}")