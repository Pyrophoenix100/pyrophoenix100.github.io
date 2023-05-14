import os

category_name = input("Category name: ")
folder_name = input("Page name: ")
markdown_dir = os.path.join(os.curdir, "markdown", category_name, folder_name)
markdown_file_path = os.path.join(markdown_dir, "markdown.tmd")

os.makedirs(markdown_dir, exist_ok=True)
print(f"New folder created: {folder_name}")

with open(markdown_file_path, "w") as f:
    before_text = """title: ;
subTitle: ;
splashImage: ;
createdDate: ;
### ENDMETADATA ###
"""
    f.write(before_text)

print(f"Markdown file created: {markdown_file_path}")
print(f"Text added to {markdown_file_path}")
