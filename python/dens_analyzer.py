import cv2
import numpy as np
import os
import re
import matplotlib.pyplot as plt

# generates a heatmap of image densities over the entire timeline

data_dir = "./hksa-tys_2-032/combo/"

def main():
    image_counts = np.zeros((512,512), dtype=int)
    ch2_counts = np.zeros((512,512), dtype=int)
    ch4_counts = np.zeros((512,512), dtype=int)

    total_count = 0

    for idx, fname in enumerate(os.listdir(data_dir)):
        img = cv2.imread(data_dir + fname)

        # do regular counting
        image_counts[np.sum(img, axis=2) > 0] += 1

        # do ch2 counting
        ch2_counts[img[:,:,0] > 0] += 1

        # do ch4 counting
        ch4_counts[img[:,:,2] > 0] += 1

        total_count += 1

    # calc densities
    image_dens = image_counts / total_count
    ch2_dens = ch2_counts / total_count
    ch4_dens = ch4_counts / total_count

    # plot heatmaps
    # - image
    image_im = plt.imshow(image_dens, cmap='hot', interpolation='nearest')
    cb = plt.colorbar(image_im)
    plt.savefig("tys_image_dens_hmap.png")
    #plt.show()
    cb.remove()
    # - ch2
    ch2_im = plt.imshow(ch2_dens, cmap='hot', interpolation='nearest')
    cb = plt.colorbar(ch2_im)
    plt.savefig("tys_ch2_dens_hmap.png")
    #plt.show()
    cb.remove()
    # - ch4
    ch4_im = plt.imshow(ch4_dens, cmap='hot', interpolation='nearest')
    cb = plt.colorbar(ch4_im)
    plt.savefig("tys_ch4_dens_hmap.png")
    #plt.show()
    cb.remove()

if __name__ == "__main__":
    main()
