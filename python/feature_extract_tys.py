import cv2
import numpy as np
import os
import json

# extracts features (see below) from each image from the tys group
# note: files are separated due to differences in tuning parameters

data_dir = "./hksa-tys_2-032/combo/"

def main():
    # format: area of alveoli, area of interstitial, area of neutrophils, <alveoli x, alveoli y>, <alveoli areas>, <alveoli contours>, <neutrophil x, neutrophil y>, <neutrophil areas>, <neutrophil contours>
    feature_data = []

    for idx, fname in enumerate(os.listdir(data_dir)):
        feature_info = {}

        img = cv2.imread(data_dir + fname)
        img_dnois = cv2.fastNlMeansDenoisingColored(img, None, 40, 40, 7, 21) # (40, 40) works pretty well
        img_dnois = cv2.GaussianBlur(img_dnois, (15,15), 0) # (15, 15) works pretty well

        gray_img_dnois = cv2.cvtColor(img_dnois, cv2.COLOR_BGR2GRAY)
        ret, gray_img_dnois = cv2.threshold(gray_img_dnois, 5, 255, 0)

        # - alveoli processing
        # get contours of alveoli
        top = bottom = left = right = 1
        gray_img_dnois = cv2.copyMakeBorder(gray_img_dnois, top, bottom, left, right, cv2.BORDER_CONSTANT, None, 255)
        contrs, hier = cv2.findContours(gray_img_dnois, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        areas = []
        for contr in contrs:
            areas.append(cv2.contourArea(contr))
        max_area = sorted(areas)[-2] # need this for getting rid of black regions of image that are not alveoli

        total_area = 512.0 * 512.0
        interstitial_area = total_area
        alveoli_area = 0.
        areas_per_alveoli = {}
        contr_centers = {}
        contr_locs = {}

        for jdx, contr in enumerate(contrs):
            area = cv2.contourArea(contr)

            if (area > 40) and (area < (0.95 * max_area)):
                # get features
                interstitial_area -= area
                alveoli_area += area
                M = cv2.moments(contr)
                cx = M['m10'] / M['m00']
                cy = M['m01'] / M['m00']
                epsilon = 0.01 * cv2.arcLength(contr, True)
                approx_contr = cv2.approxPolyDP(contr, epsilon, True)

                # store features
                areas_per_alveoli[jdx] = round(area, 2)
                contr_centers[jdx] = [round(cx, 2), round(cy, 2)]
                contr_locs[jdx] = approx_contr.tolist()

        # - neutrophil processing
        img_neut = img[:,:,2]

        # denoise
        img_neut_proc = cv2.fastNlMeansDenoising(img_neut, None, 45, 9, 21) # NOTE adjust this for num neutrophils detected (i.e. more noise filtered), default was (50,7,21)
        eh_ret, img_neut_proc = cv2.threshold(img_neut_proc, 225, 255, 0)
        img_neut_proc = cv2.dilate(img_neut_proc, np.ones((4,4), np.uint8), iterations=1)

        # get contours of neutrophils
        neut_contrs, neut_hier = cv2.findContours(img_neut_proc, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

        neutrophil_area = 0.
        areas_per_neut = {}
        neut_contr_centers = {}
        neut_contr_locs = {}

        for jdx, contr in enumerate(neut_contrs):
            area = cv2.contourArea(contr)

            # get features
            neutrophil_area += area
            M = cv2.moments(contr)
            cx = M['m10'] / M['m00']
            cy = M['m01'] / M['m00']
            epsilon = 0.05 * cv2.arcLength(contr, True)
            approx_contr = cv2.approxPolyDP(contr, epsilon, True)

            # store features
            areas_per_neut[jdx] = round(area, 2)
            neut_contr_centers[jdx] = [round(cx, 2), round(cy, 2)]
            neut_contr_locs[jdx] = approx_contr.tolist()

        # save extracted features in overall data structures, then write to file
        feature_info['alveoli_area'] = round(alveoli_area, 2)
        feature_info['interstitial_area'] = round(interstitial_area, 2)
        feature_info['neutrophil_area'] = round(neutrophil_area, 2)
        feature_info['areas_per_alveoli'] = areas_per_alveoli
        feature_info['alveoli_location'] = contr_centers
        feature_info['alveoli_contour_outlines'] = contr_locs
        feature_info['areas_per_neutrophil'] = areas_per_neut
        feature_info['neutrophil_location'] = neut_contr_centers
        feature_info['neutrophil_contour_outlines'] = neut_contr_locs

        feature_data.append(feature_info)

    with open('extracted_features_tys.json', 'w') as f:
        json.dump(feature_data, f)

if __name__ == "__main__":
    main()
