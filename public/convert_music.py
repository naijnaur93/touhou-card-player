import os

extension = ".mp3"
output_extension = ".aac"
output_bitrate = "128k"
path = "./public/music/"
backup_path = "./public/original_music/"

def convert_file(subdir, filename):
    input_filename = os.path.join(path, subdir, filename)
    output_filename = os.path.join(backup_path, subdir, filename)
    output_filename = os.path.splitext(output_filename)[0] + output_extension
    ffmpeg_command = [
        "ffmpeg",
        "-y",
        "-i", f"\"{input_filename}\"",
        "-map", "0:a:0",
        "-b:a", output_bitrate,
        f"\"{output_filename}\""
    ]
    os.system(" ".join(ffmpeg_command))
    

if __name__ == "__main__":
    # rename path to backup_path
    assert(os.path.exists(path))
    os.makedirs(backup_path, exist_ok=True)
    
    # convert all files
    for (dirpath, dirnames, filenames) in os.walk(path):
        if not ("妖々夢" in dirpath): continue
        subdir = os.path.relpath(dirpath, path)
        os.makedirs(os.path.join(backup_path, subdir), exist_ok=True)
        for filename in filenames:
            print(f"Checking {subdir}/{filename}")
            if filename.endswith(extension):
                convert_file(subdir, filename)
                print(f"Converted {subdir}/{filename}")