import numpy as np
import matplotlib.pyplot as plt
import cv2
import os
import re

data_dir = "./hksa-control_2-028/"

def main():

    # read in images (Ch2 and Ch4)
    # note: match according to img id num
    for idx, fname in enumerate(os.listdir(data_dir + "ch2/")):
        code_str = re.split("(\.ome)?\.tif", (re.split("Ch2[-_]", fname))[1])[0]
        ch4_fname = fname.replace("Ch2", "Ch4")
        ch2_img = cv2.imread(data_dir + "ch2/" + fname, cv2.IMREAD_GRAYSCALE)
        try:
            ch4_img = cv2.imread(data_dir + "ch4/" + ch4_fname, cv2.IMREAD_GRAYSCALE)

            # direct overlay
            # - max signals in each image for clarity and future processing
            ch2_img[ch2_img > 0] = 255
            ch4_img[ch4_img > 0] = 255
            # - put Ch2 in "b" index of rgb array, put Ch4 in "r" index of rgb array
            phold_img = np.zeros_like(ch2_img)
            new_img = np.asarray([ch2_img, phold_img, ch4_img])
            new_img = np.moveaxis(new_img, 0, -1) # NOTE this could be much faster, check np.einsum if necessary
            # - (view and) export image as new file
            cv2.imwrite(data_dir + "combo/" + code_str + ".png", new_img)
        except:
            print("image mismatch")

if __name__ == "__main__":
    main()
