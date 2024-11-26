prefix = "./cards-enbu-dolls/"
cards = [
"レミリア",
"フラン",
"アリス＆上海蓬莱",
"妖夢",
"紫",
"鈴仙",
"こいし",
"空",
"ナズーリン",
"青娥",
"響子",
"雷鼓",
"純狐",
"萃香",
]
required_ratio = 703 / 1000

import cv2
import math 
import os
import numpy as np
import shutil

def center_card(filename):
    new_filename = os.path.join(prefix, filename + "_c.png")
    filename = os.path.join(prefix, filename + ".png")
    image = cv2.imdecode(np.fromfile(filename, dtype=np.uint8),
                    cv2.IMREAD_UNCHANGED)
    # rename filename to new_filename
    image = np.array(image)
    height, width, _ = image.shape
    if width / height <= required_ratio:
        print(f"Skipping {filename}")
        return
    new_width = height * required_ratio
    cut = int((width - new_width) // 2)
    image = image[:, cut:width - cut]
    os.rename(filename, new_filename)
    cv2.imencode(".png", image)[1].tofile(filename)

if __name__ == "__main__":
    for card in cards:
        center_card(card)

