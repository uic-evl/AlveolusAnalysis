import numpy as np
import matplotlib.pyplot as plt
import cv2
import os
import re

data_dir = "./hksa-control_2-028/"

def main():
    # processing strats:
    # 1. save all images as only their id in two folders, one for ch2 and one for ch4
    # - then we only need to loop in order through each (checking for conflicts) parsing as we go
    # 2. save all images in one giant folder preserving filenames
    # - loop through once first divide into ch2 and ch4, sort each lexicographically, then just do 1
    # notes:
    #  - may need to split by cycles, can be done either pre or post
    #  - this happens first but be sure to order appropriately, feature extraction, etc. happens after this
    # feature ideas:
    #  - frequencies at different timescales (per cycle): entire cycle, 50, 100, 1000 frames
    #    + does the intensity of the grayscale imgs matter?
    #  - object/shape detection and location tracking

    # read in images (Ch2 and Ch4)
    # - match according to img id num
    #ch2_img = cv2.imread("../test_data/ch2/hksa-tys 2-032-Ch2-16bit-Reference.tif", cv2.IMREAD_GRAYSCALE)
    #cv2.imshow("ch2 raw image", ch2_img)
    #cv2.waitKey(0)
    #ch4_img = cv2.imread("../test_data/ch4/hksa-tys 2-032-Ch4-16bit-Reference.tif", cv2.IMREAD_GRAYSCALE)
    #cv2.imshow("ch4 raw image", ch4_img)
    #cv2.waitKey(0)
    #cv2.destroyAllWindows()
    #img_scaled = cv2.normalize(img, dst=None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX)
    #plt.imshow("scaled image", img_scaled)
    #cv2.waitKey(0)
    for idx, fname in enumerate(os.listdir(data_dir + "ch2/")):
        #print("fname")
        #print(fname)
        code_str = re.split("(\.ome)?\.tif", (re.split("Ch2[-_]", fname))[1])[0]
        #print("code_str")
        #print(code_str)
        ch4_fname = fname.replace("Ch2", "Ch4")
        ch2_img = cv2.imread(data_dir + "ch2/" + fname, cv2.IMREAD_GRAYSCALE)
        try:
            ch4_img = cv2.imread(data_dir + "ch4/" + ch4_fname, cv2.IMREAD_GRAYSCALE)
            #cv2.imshow("a", ch2_img)
            #cv2.waitKey(0)
            #cv2.imshow("b", ch4_img)
            #cv2.waitKey(0)
            #cv2.destroyAllWindows()

            # method 1: direct overlay
            # - put Ch2 in "b" index of rgb array
            # - put Ch4 in "r" index of rgb array
            # note: check which format/order of rgb OpenCV uses
            # - view and export image as new file
            #print("ch2_img")
            #print(ch2_img)
            #print("ch4_img")
            #print(ch4_img)
            ch2_img[ch2_img > 0] = 255
            ch4_img[ch4_img > 0] = 255
            #print("ch2_img")
            #print(ch2_img)
            #print("ch4_img")
            #print(ch4_img)
            #cv2.imshow("a", ch2_img)
            #cv2.waitKey(0)
            #cv2.imshow("b", ch4_img)
            #cv2.waitKey(0)
            #cv2.destroyAllWindows()
            phold_img = np.zeros_like(ch2_img)
            new_img = np.asarray([ch2_img, phold_img, ch4_img])
            new_img = np.moveaxis(new_img, 0, -1) # NOTE this could be much faster, check np.einsum if necessary
            #cv2.imshow("new img", new_img)
            #cv2.waitKey(0)
            #cv2.destroyAllWindows()
            cv2.imwrite(data_dir + "combo/" + code_str + ".png", new_img)

            #input("wait")
        except:
            print("image mismatch")

if __name__ == "__main__":
    main()
