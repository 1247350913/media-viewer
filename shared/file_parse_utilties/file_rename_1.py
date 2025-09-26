import os
import re

def rename_files(episode_num):

    target_directory = os.getcwd()
    files = [f for f in os.listdir(target_directory) if f.endswith(('.mp4', '.mkv'))]
    files.sort()
    renames, all_success = [], True

    for file in files:
        if not all_success: break
        match = re.search(r"E\d{2} (.*)", file)
        if match:
            title = match.group(1)
            new_name = f"{episode_num}_{title}"
            print(f"{file} -> {new_name}")
            old_file_path = os.path.join(target_directory, file)
            new_file_path = os.path.join(target_directory, new_name)
            renames.append((old_file_path, new_file_path))
            episode_num += 1
        else:
            print(f"Skipped: {file} (Pattern not found). Aborted...")
            all_success = False

    if all_success:
        user_input = input("\nAre you okay with these changes (Y/N)? ").strip().lower()
        if user_input == 'y':
            for rename in renames:
                os.rename(rename[0], rename[1])
            print(f"Renamed {len(renames)} / {len(files)} files")
        else:
            print("Aborted.")


if __name__ == "__main__":
    try:
        start_index = int(input("Enter the first episode global number: "))
        rename_files(start_index)
    except ValueError:
        print("Please enter a valid integer.")
