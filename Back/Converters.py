import re
from bitarray import bitarray

DATA = ""
BASE64Q = ""

with open('sheet.bin', 'rb') as file: 
    DATA_UNCLEANED = file.read()
    decoded_data = DATA_UNCLEANED.decode('ascii')  
    cleaned_data = re.sub(r'\s+', '', decoded_data)
    DATA = cleaned_data.encode('ascii')  # Adjust encoding if necessary

with open('Base64Q.txt','r') as file: BASE64Q = file.read()


def convertDecimalToBinary(value, zeroFill):
    return bin(value).zfill(zeroFill)

def convertDecimalToBase64Q(value, zeroFill): 
    string = ""
    
    while (value):
        string = BASE64Q[value%64] + string
        value = int(value/64)        
    return (zeroFill - len(string)) * "0" +string

def convertBase64QToDecimal(string):
    integer = 0
    
    pos = len(string)-1
    for char in string:
        integer += BASE64Q.find(char) * (64**pos)
        pos -= 1
        
    return integer

def convertBase64QToBinary(string,zeroFill):
    return bin(convertBase64QToDecimal(string))[2:].zfill(zeroFill)


l = 85
# NUOVA SONG
id_song = 1600727

print(DATA_UNCLEANED)


# The 24-bit value
value = 0b00000001000000100000001100000100

# Split the 24-bit value into three 8-bit bytes
byte0 = (value >> 24) & 0xFF  # Extract the first 8 bits (most significant byte)
byte1 = (value >> 16) & 0xFF  # Extract the first 8 bits (most significant byte)
byte2 = (value >> 8) & 0xFF   # Extract the next 8 bits (middle byte)
byte3 = value & 0xFF          # Extract the last 8 bits (least significant byte)

# Open the file in binary write mode
with open("test.bin", "wb") as file:
    # Write the three bytes to the file
    file.write(bytes([byte0, byte1, byte2, byte3]))
    

# Open the file in binary read mode
with open("test.bin", "rb") as file:
    # Read the content of the file
    content = file.read()

# Print each byte in the file as a binary string
for byte in content:
    print(f"{bin(byte)[2:].zfill(8)}")
    
    
"""
    
with open("test.bin", "rb") as file:
    # Read the content of the file
    content = file.read()

# Print the content as a binary string
print(f"Binary content: {bin(int.from_bytes(content, byteorder='big'))[2:].zfill(8)}")
"""

"""
with open('sheet.bin', 'wb') as file:
    dataToAdd = b""
    
    for i in range(100):
        id_song = convertDecimalToBase64Q(i,24)
        data = convertBase64QToBinary(id_song, 24)
        dataToAdd += b"\n" + data.encode('utf-8') + b"\t" + b"0101"
        
    file.write(DATA_UNCLEANED + dataToAdd)
    print("done")
"""
