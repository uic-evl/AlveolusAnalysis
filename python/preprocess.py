import numpy as np
import matplotlib.pyplot as plt
import cv2
import os
import re
import json
import sys
import getopt

spec_hyperparams = {}
known_hyperparams = ["img_path", "h_alv", "tws_alv", "sws_alv", "gbks", "thresh", "min_area", "h_neut", "tws_neut", "sws_neut", "dks", "ff_window", "ff_loc_sens", "ff_size_sens"]

def handle_hyperparams(args):
    try: 
        opts, args = getopt.getopt(args, "mp:h:t:s:g:r:a:e:w:n:d:o:l:z:", ["manual_mode", "img_path=", "h_alv=", "tws_alv=", "sws_alv=", "gbks=", "thresh=", "min_area=", "h_neut=", "tws_neut=", "sws_neut=", "dks=", "ff_window=", "ff_loc_sens=", "ff_size_sens="])
    except getopt.GetoptError as err:
        print("Usage: python preprocess.py -m -p <path to images> -h <denoising filter strength for alveoli> -t <template size for alveoli> -s <search size for alveoli> -g <gaussian blur size> -r <threshold value> -a <min area of feature acceptance> -e <denoising filter strength for neutrophils> -w <template size for neutrophils> -n <search size for neutrophils> -d <dilation size> -o <number of frames for reference in filtering> -l <location sensitivity for feature filtering> -z <size sensitivity for feature filtering>")
        print("-OR-")
        print("Usage: python preprocess.py --manual_mode --img_path <path to images> --h_alv <denoising filter strength for alveoli> --tws_alv <template size for alveoli> --sws_alv <search size for alveoli> --gbks <gaussian blur size> --thresh <threshold value> --min_area <min area of feature acceptance> --h_neut <denoising filter strength for neutrophils> --tws_neut <template size for neutrophils> --sws_neut <search size for neutrophils> --dks <dilation size> --ff_window <number of frames for reference in filtering> --ff_loc_sense <location sensitivity for feature filtering> --ff_size_sens <size sensitivity for feature filtering>")
        print("Descriptions for each parameter:")
        print("Denoising Filter Strength {h_alv} --- used in feature extraction; removes noise from images but can also remove image details if set too high [recommended starting value = 35]")
        print("Template Size {tws_alv} --- used in feature extraction, must be odd number; area to calculate denoising operation, so a smaller value will focus on eliminating fine noise [recommended starting value = 7]")
        print("Search Size {sws_alv} --- used in feature extraction, must be odd number; area to calculate averaging operation, so a smaller value will only use very close regions of image to fill in noise [recommended starting value = 21]")
        print("Blur Kernel Size {gbks} --- used in feature extraction, must be odd number; area to blur image to further eliminate holes/edges caused by noise [recommended starting value = 11]")
        print("Threshold {thresh} --- used in feature extraction; limit pixel intensity to keep in image, effectively eliminates noisy pixels leftover by the denoising and blurring operations [recommended starting value = 5]")
        print("Min Area {min_area} --- used in feature extraction; minimum area a detected region must have in order to be maintained as a detected feature [recommended starting value = 15, but this is highly dependent on quality of videos]")
        print("Denoising Filter Strength {h_neut} --- used in feature extraction; removes noise from images but can also remove image details if set too high [recommended starting value = 45]")
        print("Template Size {tws_neut} --- used in feature extraction, must be odd number; area to calculate denoising operation, so a smaller value will focus on eliminating fine noise [recommended starting value = 7]")
        print("Search Size {sws_neut} --- used in feature extraction, must be odd number; area to calculate averaging operation, so a smaller value will only use very close regions of image to fill in noise [recommended starting value = 21]")
        print("Dilate Kernel Size {dks} --- used in feature extraction; slightly expands detected neutrophil pixels to more accurately represent actual neutrophil areas [recommended starting value = 4]")
        print("Feature Filter Window {ff_window} --- used in feature filtering; how many frames features must persist across (unidirectional) in both size and location [recommended starting value = 1]")
        print("Filter Location Sensitivity {ff_loc_sens} --- used in feature filtering; how close feature centers should be in neighboring frames to be counted as the same, note that the unit here is pixels [recommended starting value = 10]")
        print("Filter Size Sensitivity {ff_size_sens} --- used in feature filtering; how close feature areas should be in neighboring frames to be counted as the same, note that the unit here is (approximately) square pixels [recommended starting value = 20]")
        print(err)
        sys.exit(2)

    man_mode = 0

    seen_hyperparams = []
    for o, a in opts:
        if o in ("-m", "--manual_mode"):
            man_mode = 1
        elif o in ("-p", "--imgpath"):
            spec_hyperparams["img_path"] = a
            seen_hyperparams.append("img_path")
        elif o in ("-h", "--h_alv"):
            spec_hyperparams["h_alv"] = int(a)
            seen_hyperparams.append("h_alv")
        elif o in ("-t", "--tws_alv"):
            spec_hyperparams["tws_alv"] = int(a)
            seen_hyperparams.append("tws_alv")
        elif o in ("-s", "--sws_alv"):
            spec_hyperparams["sws_alv"] = int(a)
            seen_hyperparams.append("sws_alv")
        elif o in ("-g", "--gbks"):
            spec_hyperparams["gbks"] = int(a)
            seen_hyperparams.append("gbks")
        elif o in ("-r", "--thresh"):
            spec_hyperparams["thresh"] = int(a)
            seen_hyperparams.append("thresh")
        elif o in ("-a", "--min_area"):
            spec_hyperparams["min_area"] = int(a)
            seen_hyperparams.append("min_area")
        elif o in ("-e", "--h_neut"):
            spec_hyperparams["h_neut"] = int(a)
            seen_hyperparams.append("h_neut")
        elif o in ("-w", "--tws_neut"):
            spec_hyperparams["tws_neut"] = int(a)
            seen_hyperparams.append("tws_neut")
        elif o in ("-n", "--sws_neut"):
            spec_hyperparams["sws_neut"] = int(a)
            seen_hyperparams.append("sws_neut")
        elif o in ("-d", "--dks"):
            spec_hyperparams["dks"] = int(a)
            seen_hyperparams.append("dks")
        elif o in ("-o", "--ff_window"):
            spec_hyperparams["ff_window"] = int(a)
            seen_hyperparams.append("ff_window")
        elif o in ("-l", "--ff_loc_sens"):
            spec_hyperparams["ff_loc_sens"] = int(a)
            seen_hyperparams.append("ff_loc_sens")
        elif o in ("-z", "--ff_size_sens"):
            spec_hyperparams["ff_size_sens"] = int(a)
            seen_hyperparams.append("ff_size_sens")
        else:
            assert False, "unhandled option"

    leftover_hyperparams = list(set(known_hyperparams) - set(seen_hyperparams))
    if leftover_hyperparams and man_mode:
        for hp in leftover_hyperparams:
            print(hp)
            if hp == "h_alv":
                print("Please enter a value for the h_alv parameter. A description is provided below:")
                print("Denoising Filter Strength {h_alv} --- used in feature extraction; removes noise from images but can also remove image details if set too high [recommended starting value = 35]")
                a = input()
                spec_hyperparams["h_alv"] = int(a)
            elif hp == "tws_alv":
                print("Please enter a value for the tws_alv parameter. A description is provided below:")
                print("Template Size {tws_alv} --- used in feature extraction, must be odd number; area to calculate denoising operation, so a smaller value will focus on eliminating fine noise [recommended starting value = 7]")
                a = input()
                spec_hyperparams["tws_alv"] = int(a)
            elif hp == "sws_alv":
                print("Please enter a value for the sws_alv parameter. A description is provided below:")
                print("Search Size {sws_alv} --- used in feature extraction, must be odd number; area to calculate averaging operation, so a smaller value will only use very close regions of image to fill in noise [recommended starting value = 21]")
                a = input()
                spec_hyperparams["sws_alv"] = int(a)
            elif hp == "gbks":
                print("Please enter a value for the gbks parameter. A description is provided below:")
                print("Blur Kernel Size {gbks} --- used in feature extraction, must be odd number; area to blur image to further eliminate holes/edges caused by noise [recommended starting value = 11]")
                a = input()
                spec_hyperparams["gbks"] = int(a)
            elif hp == "thresh":
                print("Please enter a value for the thresh parameter. A description is provided below:")
                print("Threshold {thresh} --- used in feature extraction; limit pixel intensity to keep in image, effectively eliminates noisy pixels leftover by the denoising and blurring operations [recommended starting value = 5]")
                a = input()
                spec_hyperparams["thresh"] = int(a)
            elif hp == "min_area":
                print("Please enter a value for the min_area parameter. A description is provided below:")
                print("Min Area {min_area} --- used in feature extraction; minimum area a detected region must have in order to be maintained as a detected feature [recommended starting value = 15, but this is highly dependent on quality of videos]")
                a = input()
                spec_hyperparams["min_area"] = int(a)
            elif hp == "h_neut":
                print("Please enter a value for the h_neut parameter. A description is provided below:")
                print("Denoising Filter Strength {h_neut} --- used in feature extraction; removes noise from images but can also remove image details if set too high [recommended starting value = 45]")
                a = input()
                spec_hyperparams["h_neut"] = int(a)
            elif hp == "tws_neut":
                print("Please enter a value for the tws_neut parameter. A description is provided below:")
                print("Template Size {tws_neut} --- used in feature extraction, must be odd number; area to calculate denoising operation, so a smaller value will focus on eliminating fine noise [recommended starting value = 7]")
                a = input()
                spec_hyperparams["tws_neut"] = int(a)
            elif hp == "sws_neut":
                print("Please enter a value for the sws_neut parameter. A description is provided below:")
                print("Search Size {sws_neut} --- used in feature extraction, must be odd number; area to calculate averaging operation, so a smaller value will only use very close regions of image to fill in noise [recommended starting value = 21]")
                a = input()
                spec_hyperparams["sws_neut"] = int(a)
            elif hp == "dks":
                print("Please enter a value for the dks parameter. A description is provided below:")
                print("Dilate Kernel Size {dks} --- used in feature extraction; slightly expands detected neutrophil pixels to more accurately represent actual neutrophil areas [recommended starting value = 4]")
                a = input()
                spec_hyperparams["dks"] = int(a)
            elif hp == "ff_window":
                print("Please enter a value for the ff_window parameter. A description is provided below:")
                print("Feature Filter Window {ff_window} --- used in feature filtering; how many frames features must persist across (unidirectional) in both size and location [recommended starting value = 1]")
                a = input()
                spec_hyperparams["ff_window"] = int(a)
            elif hp == "ff_loc_sens":
                print("Please enter a value for the ff_loc_sens parameter. A description is provided below:")
                print("Filter Location Sensitivity {ff_loc_sens} --- used in feature filtering; how close feature centers should be in neighboring frames to be counted as the same, note that the unit here is pixels [recommended starting value = 10]")
                a = input()
                spec_hyperparams["ff_loc_sens"] = int(a)
            elif hp == "ff_size_sens":
                print("Please enter a value for the ff_size_sens parameter. A description is provided below:")
                print("Filter Size Sensitivity {ff_size_sens} --- used in feature filtering; how close feature areas should be in neighboring frames to be counted as the same, note that the unit here is (approximately) square pixels [recommended starting value = 20]")
                a = input()
                spec_hyperparams["ff_size_sens"] = int(a)

    if leftover_hyperparams and not man_mode or "img_path" not in spec_hyperparams:
        print("Unspecified parameters!")
        sys.exit(2)

def combine_images(proc_data_dir):
    for idx, fname in enumerate(os.listdir(proc_data_dir + "ch2/")):
        code_str = re.split("(\.ome)?\.tif", (re.split("Ch2[-_]", fname))[1])[0]
        ch4_fname = fname.replace("Ch2", "Ch4")
        ch2_img = cv2.imread(proc_data_dir + "ch2/" + fname, cv2.IMREAD_GRAYSCALE)
        try:
            ch4_img = cv2.imread(proc_data_dir + "ch4/" + ch4_fname, cv2.IMREAD_GRAYSCALE)
            ch2_img[ch2_img > 0] = 255
            ch4_img[ch4_img > 0] = 255
            phold_img = np.zeros_like(ch2_img)
            new_img = np.asarray([ch2_img, phold_img, ch4_img])
            new_img = np.moveaxis(new_img, 0, -1)
            cv2.imwrite(proc_data_dir + "combo/" + code_str + ".png", new_img)
        except:
            print("image mismatch")

def feature_extract(proc_data_dir):
    feature_data = []

    for idx, fname in enumerate(os.listdir(proc_data_dir + "combo/")):
        feature_info = {}

        img = cv2.imread(proc_data_dir + "combo/" + fname)

        img_dnois = cv2.fastNlMeansDenoisingColored(img, None, spec_hyperparams["h_alv"], spec_hyperparams["h_alv"], spec_hyperparams["tws_alv"], spec_hyperparams["sws_alv"])
        img_dnois = cv2.GaussianBlur(img_dnois, (spec_hyperparams["gbks"],spec_hyperparams["gbks"]), 0)

        gray_img_dnois = cv2.cvtColor(img_dnois, cv2.COLOR_BGR2GRAY)
        ret, gray_img_dnois = cv2.threshold(gray_img_dnois, spec_hyperparams["thresh"], 255, 0)

        top = bottom = left = right = 1
        gray_img_dnois = cv2.copyMakeBorder(gray_img_dnois, top, bottom, left, right, cv2.BORDER_CONSTANT, None, 255)
        contrs, hier = cv2.findContours(gray_img_dnois, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        areas = []
        for contr in contrs:
            areas.append(cv2.contourArea(contr))
        if len(areas) < 2:
            max_area = 0.
        else:
            max_area = sorted(areas)[-2]

        total_area = 512.0 * 512.0
        interstitial_area = total_area
        alveoli_area = 0.
        areas_per_alveoli = {}
        contr_centers = {}
        contr_locs = {}

        for jdx, contr in enumerate(contrs):
            area = cv2.contourArea(contr)

            if (area > spec_hyperparams["min_area"]) and (area < (0.95 * max_area)):
                interstitial_area -= area
                alveoli_area += area
                M = cv2.moments(contr)
                cx = M['m10'] / M['m00']
                cy = M['m01'] / M['m00']
                epsilon = 0.01 * cv2.arcLength(contr, True)
                approx_contr = cv2.approxPolyDP(contr, epsilon, True)

                areas_per_alveoli[jdx] = round(area, 2)
                contr_centers[jdx] = [round(cx, 2), round(cy, 2)]
                contr_locs[jdx] = approx_contr.tolist()

        # neutrophil stuff
        img_neut = img[:,:,2]

        # - denoise
        img_neut_proc = cv2.fastNlMeansDenoising(img_neut, None, spec_hyperparams["h_neut"], spec_hyperparams["tws_neut"], spec_hyperparams["sws_neut"])
        eh_ret, img_neut_proc = cv2.threshold(img_neut_proc, 225, 255, 0)
        img_neut_proc = cv2.dilate(img_neut_proc, np.ones((spec_hyperparams["dks"],spec_hyperparams["dks"]), np.uint8), iterations=1)

        neut_contrs, neut_hier = cv2.findContours(img_neut_proc, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

        neutrophil_area = 0.
        areas_per_neut = {}
        neut_contr_centers = {}
        neut_contr_locs = {}

        for jdx, contr in enumerate(neut_contrs):
            area = cv2.contourArea(contr)

            neutrophil_area += area
            M = cv2.moments(contr)
            cx = M['m10'] / M['m00']
            cy = M['m01'] / M['m00']
            epsilon = 0.05 * cv2.arcLength(contr, True)
            approx_contr = cv2.approxPolyDP(contr, epsilon, True)

            areas_per_neut[jdx] = round(area, 2)
            neut_contr_centers[jdx] = [round(cx, 2), round(cy, 2)]
            neut_contr_locs[jdx] = approx_contr.tolist()

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

    return feature_data

def feature_tracking(feature_data):
    data = feature_data

    for idx, img_feat in enumerate(data):
        curr_feat = img_feat['neutrophil_location'].values()
        curr_ar = list(img_feat['areas_per_neutrophil'].values())
        feats = []
        ars = []
        # backwards
        for i in range(spec_hyperparams["ff_window"]):
            other_i = idx - (i + 1)
            if (idx != other_i) and (other_i >= 0):
                feats.append(data[other_i]['neutrophil_location'].values())
                ars.append(list(data[other_i]['areas_per_neutrophil'].values()))

        # forwards
        for i in range(spec_hyperparams["ff_window"]):
            other_i = idx + (i + 1)
            if (idx != other_i) and (other_i < len(data)):
                feats.append(data[other_i]['neutrophil_location'].values())
                ars.append(list(data[other_i]['areas_per_neutrophil'].values()))

        kept_neuts = []
        for yeahdx, other_feat in enumerate(feats):
            invalid_neuts = []
            for jdx, loc in enumerate(curr_feat):
                # only keep searching if we haven't matched them up yet
                if jdx not in kept_neuts:
                    for kdx, other_loc in enumerate(other_feat):
                        # only check if this (other) neut hasn't matched yet
                        if kdx not in invalid_neuts:
                            if (np.linalg.norm(np.asarray(loc) - np.asarray(other_loc)) < spec_hyperparams["ff_loc_sens"]) and (abs(curr_ar[jdx] - ars[yeahdx][kdx]) < spec_hyperparams["ff_size_sens"]):
                                kept_neuts.append(jdx)
                                invalid_neuts.append(kdx)
                                break

        new_neut_areas_keys = np.take(list(img_feat['areas_per_neutrophil'].keys()), kept_neuts)
        new_neut_areas = np.take(list(img_feat['areas_per_neutrophil'].values()), kept_neuts)
        new_total_area = sum(new_neut_areas)
        new_neut_locs_keys = np.take(list(img_feat['neutrophil_location'].keys()), kept_neuts)
        new_neut_locs = np.take(list(img_feat['neutrophil_location'].values()), kept_neuts, axis=0)
        new_neut_contrs_keys = np.take(list(img_feat['neutrophil_contour_outlines'].keys()), kept_neuts)
        new_neut_contrs = np.take(list(img_feat['neutrophil_contour_outlines'].values()), kept_neuts, axis=0)

        img_feat['areas_per_neutrophil'] = dict(zip(new_neut_areas_keys.tolist(), new_neut_areas.tolist()))
        img_feat['neutrophil_area'] = new_total_area
        img_feat['neutrophil_location'] = dict(zip(new_neut_locs_keys.tolist(), new_neut_locs.tolist()))
        img_feat['neutrophil_contour_outlines'] = dict(zip(new_neut_contrs_keys.tolist(), new_neut_contrs.tolist()))

    with open("extracted_filtered_features.json", 'w') as f:
        json.dump(data, f)

    f.close()

def main():
    # disclaimer
    print()
    print("--------------------------------------------------------------------------------")
    print("ALVEOLUS ANALYSIS PREPROCESSING TOOL")
    print("Before beginning, this preprocessing script makes several assumptions regarding ")
    print("the format of the stored data and where the outputs will be. Please ensure that ")
    print("any necessary setup steps are completed before continuing past this step.")
    print("1) images are divided into two channels: ch2 and ch4, stored in two separate ")
    print("   directories, named exactly \"ch2\" and \"ch4\"")
    print("2) images are saved in the \".ome.tif\" format and is named in a format that ")
    print("   follows this general format:")
    print("                     <text>_Ch<2,4>_000001.ome.tif")
    print("   Please ensure that the \"Ch2\" or \"Ch4\" is present and the unique ID is ")
    print("   after that word in the name.")
    print("3) a directory named \"combo\" exists in the provided image directory")
    print()
    print("If these assumptions are ensured, then everything should be good to go! The tool ")
    print("will exit automatically after it completes all steps.")
    print("--------------------------------------------------------------------------------")
    print()
    input("Press -ENTER- to continue")

    # hyperparam check/spec
    handle_hyperparams(sys.argv[1:])

    # combine images
    print("--- now performing IMAGE COMBINATION step ---")
    combine_images(spec_hyperparams["img_path"])

    # feature extraction
    print("--- now performing TYS FEATURE EXTRACTION step ---")
    img_feats = feature_extract(spec_hyperparams["img_path"])

    # neutrophil filtering
    print("--- now performing FEATURE TRACKING step ---")
    feature_tracking(img_feats)

    # cleanup
    print()
    print("Preprocessing completed! The output images and data files can be found in the ")
    print("following locations:")
    print("Images: <data_dir>/combo/")
    print("Data: ./extracted_filtered_features.json")

if __name__ == "__main__":
    main()
