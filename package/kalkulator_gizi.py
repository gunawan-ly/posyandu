import pandas as pd
import os
import math

def hitung_z_score_lms(nilai_aktual, l, m, s):
    # Menghitung Z-score menggunakan metode LMS dari WHO
    if l == 0:
        return math.log(nilai_aktual / m) / s
    else:
        return (((nilai_aktual / m)**l) - 1) / (l * s)

