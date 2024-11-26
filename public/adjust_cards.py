aspect_height = 1000
aspect_width = 703
aspect_ratio = aspect_height / aspect_width

import cv2
import math 
import os
import numpy as np
import shutil

original_path = "cards-enbu-original"
adjusted_path = "cards-enbu"

def adjust_cards(filename):
    print(f"Adjusting {filename}")
    original_filename = os.path.join(original_path, filename)
    image = cv2.imdecode(np.fromfile(original_filename, dtype=np.uint8),
                    cv2.IMREAD_UNCHANGED)
    height, width, _ = image.shape
    print(f"Height: {height}, Width: {width}")
    ratio = height / width
    if ratio > aspect_ratio:
        new_height = height
        new_width = new_height / aspect_ratio
        pad_width = math.ceil((new_width - width) / 2)
        print(f"New Height: {new_height}, New Width: {new_width}, Pad Width: {pad_width}")
        # pad with transparent pixels
        new_image = cv2.copyMakeBorder(image, 0, 0, pad_width, pad_width, cv2.BORDER_CONSTANT, value=[0, 0, 0, 0])
        # save the new image
        adjusted_filename = os.path.join(adjusted_path, filename)
        # encode the im_resize into the im_buf_arr, which is a one-dimensional ndarray
        is_success, im_buf_arr = cv2.imencode(".png", new_image)
        im_buf_arr.tofile(adjusted_filename)
    else:
        print("No need to adjust")
        # copy image to the new folder without any changes
        shutil.copyfile(original_filename, os.path.join(adjusted_path, filename))

if __name__ == "__main__":
    if not os.path.exists(adjusted_path):
        os.makedirs(adjusted_path)
    for filename in os.listdir(original_path):
        if filename.endswith(".png"):
            adjust_cards(filename)


