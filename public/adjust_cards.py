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

def cut_card(image: np.ndarray):
    top = 0
    bottom = 0
    left = 0
    right = 0
    # find the top line with non-transparent pixels
    for i in range(image.shape[0]):
        if np.max(image[i, :, 3]) > 0:
            top = i
            break
    # find the bottom line with non-transparent pixels
    for i in range(image.shape[0] - 1, -1, -1):
        if np.max(image[i, :, 3]) > 0:
            bottom = i
            break
    # find the left line with non-transparent pixels
    for i in range(image.shape[1]):
        if np.max(image[:, i, 3]) > 0:
            left = i
            break
    # find the right line with non-transparent pixels
    for i in range(image.shape[1] - 1, -1, -1):
        if np.max(image[:, i, 3]) > 0:
            right = i
            break
    top = max(0, top - 1)
    bottom = min(image.shape[0], bottom + 2)
    left = max(0, left - 1)
    right = min(image.shape[1], right + 2)
    image = image[top:bottom, left:right]
    # keep 10% padding each side
    hpad = math.ceil(image.shape[0] * 0.1)
    wpad = math.ceil(image.shape[1] * 0.1)
    padded = np.pad(image, ((hpad, hpad), (wpad, wpad), (0, 0)), mode='constant', constant_values=0)
    return padded

def adjust_cards(filename):
    print(f"Adjusting {filename}")
    original_filename = os.path.join(original_path, filename)
    image = cv2.imdecode(np.fromfile(original_filename, dtype=np.uint8),
                    cv2.IMREAD_UNCHANGED)
    height, width, _ = image.shape
    print(f"Height: {height}, Width: {width}")
    image = np.array(image)
    image = cut_card(image)
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
        is_success, im_buf_arr = cv2.imencode(".png", image)
        adjusted_filename = os.path.join(adjusted_path, filename)
        im_buf_arr.tofile(adjusted_filename)

if __name__ == "__main__":
    if not os.path.exists(adjusted_path):
        os.makedirs(adjusted_path)
    for filename in os.listdir(original_path):
        if filename.endswith(".png"):
            adjust_cards(filename)
    # adjust_cards("リグル.png")

