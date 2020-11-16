import numpy as np
import json

which_type = "tys"
window = 1

def main():
    #feature_info['alveoli_area'] = round(alveoli_area, 2)
    #feature_info['interstitial_area'] = round(interstitial_area, 2)
    #feature_info['neutrophil_area'] = round(neutrophil_area, 2)
    #feature_info['areas_per_alveoli'] = areas_per_alveoli
    #feature_info['alveoli_location'] = contr_centers
    #feature_info['alveoli_contour_outlines'] = contr_locs
    #feature_info['areas_per_neutrophil'] = areas_per_neut
    #feature_info['neutrophil_location'] = neut_contr_centers
    #feature_info['neutrophil_contour_outlines'] = neut_contr_locs

    f = open("extracted_features_" + which_type + ".json",)
    data = json.load(f)

    for idx, img_feat in enumerate(data):
        curr_feat = img_feat['neutrophil_location'].values()
        feats = []
        # backwards
        for i in range(window):
            other_i = idx - (i + 1)
            if (idx != other_i) and (other_i >= 0):
                feats.append(data[other_i]['neutrophil_location'].values())
        # forwards
        for i in range(window):
            other_i = idx + (i + 1)
            if (idx != other_i) and (other_i < len(data)):
                feats.append(data[other_i]['neutrophil_location'].values())

        kept_neuts = []
        for other_feat in feats:
            invalid_neuts = []
            for jdx, loc in enumerate(curr_feat):
                # only keep searching if we haven't matched them up yet
                if jdx not in kept_neuts:
                    for kdx, other_loc in enumerate(other_feat):
                        # only check if this (other) neut hasn't matched yet
                        if kdx not in invalid_neuts:
                            if np.linalg.norm(np.asarray(loc) - np.asarray(other_loc)) < 10: # NOTE change this for sensitivity
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

    with open("filtered_features_" + which_type + ".json", 'w') as f:
        json.dump(data, f)

    f.close()

if __name__ == "__main__":
    main()
