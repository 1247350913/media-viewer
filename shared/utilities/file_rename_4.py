import os
import re

def rename_files():

    target_directory = os.getcwd()
    files = [f for f in os.listdir(target_directory) if f.endswith(('.mp4', '.mkv'))]
    files.sort()
    renames = []

    for file in files:
        match = re.search(r"Episode (\d+)", file)
        if match:
            number = int(match.group(1))
            new_name = f"{number}.mp4"
            print(f"{file} -> {new_name}")
            old_file_path = os.path.join(target_directory, file)
            new_file_path = os.path.join(target_directory, new_name)
            renames.append((old_file_path, new_file_path))
        else:
            print(f"Skipped: {file} (Pattern not found).")

    user_input = input("\nAre you okay with these changes (Y/N)? ").strip().lower()
    if user_input == 'y':
      for rename in renames:
        os.rename(rename[0], rename[1])
      print(f"Renamed {len(renames)} / {len(files)} files")
    else:
      print("Operation canceled. No files were renamed.")


if __name__ == "__main__":
    rename_files()
