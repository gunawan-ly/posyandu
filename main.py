print(10*"=")
print("Kalkulator Sederhana")
print(10*"=")

angka_1 = float(input("Masukkan angka: "))
operator = input("Operator (+, -, x, /): ")
angka_2 = float(input("Masukkan angka: "))

if operator == "+":
    hasil = angka_1 + angka_2
    print(f"Hasilnya adalah {hasil}")
elif operator == "-":
    hasil = angka_1 - angka_2
    print(f"Hasilnya adalah {hasil}")
elif operator == "x" or operator == "*":
    hasil = angka_1 * angka_2
    print(f"Hasilnya adalah {hasil}")
elif operator == "/":
    hasil = angka_1 / angka_2
    print(f"Hasilnya adalah {hasil}")
else:
    print("Maaf sepertinya ada yang salah")
print("End Program")