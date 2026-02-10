csp_meta = '    <meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\' https://cdn.tailwindcss.com https://esm.sh; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src \'self\' https://fonts.gstatic.com; connect-src \'self\' https://esm.sh https://generativelanguage.googleapis.com; img-src \'self\' data:; object-src \'none\'; base-uri \'self\';">'

with open("index.html", "r") as f:
    content = f.read()

target = '<meta name="viewport" content="width=device-width, initial-scale=1.0" />'

if csp_meta in content:
    print("CSP already present.")
elif target in content:
    new_content = content.replace(target, target + "\n" + csp_meta)
    with open("index.html", "w") as f:
        f.write(new_content)
    print("CSP added successfully.")
else:
    print("Target string not found.")
