from pathlib import Path
import hashlib, urllib.request, subprocess, shutil
ROOT = Path(__file__).resolve().parent
ASSETS = [
    ("https://github.com/libnoname/noname/releases/download/v1.11.6/noname.full.zip", "noname.full.zip", "55a046e2889ed3554829e7da202b7335b653863149ccc601540050862b3720ea", "game"),
    ("https://github.com/electron/electron/releases/download/v39.5.2/electron-v39.5.2-darwin-arm64.zip", "electron.zip", "618ada5c3ea7fdd3b2405d6e2b62c895d6531b9b0e12120e26a2e20e58d68e67", "electron-runtime"),
]
for url, filename, expected, folder in ASSETS:
    archive = ROOT / filename
    if not archive.exists():
        print("Downloading", filename, flush=True)
        urllib.request.urlretrieve(url, archive)
    with archive.open("rb") as stream:
        actual = hashlib.file_digest(stream, "sha256").hexdigest()
    if actual != expected:
        raise RuntimeError(f"Checksum mismatch: {filename}")
    subprocess.run(["ditto", "-x", "-k", str(archive), str(ROOT / folder)], check=True)
shutil.copy2(ROOT / "patches/node.js", ROOT / "game/noname/init/node.js")
print("Verified and prepared. Follow the build commands in README.md.")
