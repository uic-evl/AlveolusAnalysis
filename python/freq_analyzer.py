import cv2
import numpy as np
import os
import re
import matplotlib.pyplot as plt

# generates a heatmap of image standard deviations over the entire timeline (could be useful for visualizing changes)

data_dir = "./hksa-control_2-028/combo/"

def main():
    image_counts = np.zeros((512,512), dtype=int)
    ch2_counts = np.zeros((512,512), dtype=int)
    ch4_counts = np.zeros((512,512), dtype=int)

    total_count = 0

    for idx, fname in enumerate(os.listdir(data_dir)):
        img = cv2.imread(data_dir + fname)

        # do regular counting
        image_counts += np.sum(img, axis=2)

        # do ch2 counting
        ch2_counts += img[:,:,0]

        # do ch4 counting
        ch4_counts += img[:,:,2]

        total_count += 1

    # calc densities
    image_avg = image_counts / total_count
    ch2_avg = ch2_counts / total_count
    ch4_avg = ch4_counts / total_count

    image_diffs = np.zeros((512,512))
    ch2_diffs = np.zeros((512,512))
    ch4_diffs = np.zeros((512,512))

    for idx, fname in enumerate(os.listdir(data_dir)):
        img = cv2.imread(data_dir + fname)

        image_stuff = np.sum(img, axis=2)
        image_diffs += (abs(image_stuff - image_avg))**2

        ch2_stuff = img[:,:,0]
        ch2_diffs += (abs(ch2_stuff - ch2_avg))**2

        ch4_stuff = img[:,:,2]
        ch4_diffs += (abs(ch4_stuff - ch4_avg))**2

    image_stdev = np.sqrt(image_diffs / total_count)
    ch2_stdev = np.sqrt(ch2_diffs / total_count)
    ch4_stdev = np.sqrt(ch4_diffs / total_count)

    # plot heatmaps
    # - image
    image_im = plt.imshow(image_stdev, cmap='bwr', interpolation='nearest')
    cb = plt.colorbar(image_im)
    plt.savefig("control_image_freq_hmap.png")
    #plt.show()
    cb.remove()
    # - ch2
    ch2_im = plt.imshow(ch2_stdev, cmap='bwr', interpolation='nearest')
    cb = plt.colorbar(ch2_im)
    plt.savefig("control_ch2_freq_hmap.png")
    #plt.show()
    cb.remove()
    # - ch4
    ch4_im = plt.imshow(ch4_stdev, cmap='bwr', interpolation='nearest')
    cb = plt.colorbar(ch4_im)
    plt.savefig("control_ch4_freq_hmap.png")
    #plt.show()
    cb.remove()

if __name__ == "__main__":
    main()
