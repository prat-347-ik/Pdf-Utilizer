import os

def check_font(name):
    path = os.path.join("fonts", name)
    if not os.path.exists(path):
        print(f"❌ MISSING: {name}")
        return
    
    size = os.path.getsize(path)
    if size < 10000: # Less than 10KB is definitely suspicious
        print(f"❌ CORRUPTED (Too Small): {name} ({size} bytes)")
        print("   -> You likely downloaded the HTML link, not the Raw file.")
        return

    with open(path, 'rb') as f:
        header = f.read(4)
        # Valid TTF files start with 0x00010000 or 'OTTO' or 'true'
        if header in [b'\x00\x01\x00\x00', b'OTTO', b'true']:
            print(f"✅ VALID: {name} ({size//1024} KB)")
        else:
            print(f"❌ INVALID HEADER: {name} (Header: {header})")
            print("   -> This is not a TTF file.")

print("--- Checking Fonts ---")
check_font("DejaVuSans.ttf")
check_font("NotoSansDevanagari-Regular.ttf")
check_font("NotoSansSC-Regular.ttf")
check_font("NotoSansJP-Regular.ttf")
check_font("NotoSansKR-Regular.ttf")
print("----------------------")