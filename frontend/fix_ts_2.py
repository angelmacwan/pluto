import os

base_dir = "/Users/angel/Documents/pluto/frontend"

def replace_in_file(filepath, replacements):
    full_path = os.path.join(base_dir, filepath)
    with open(full_path, "r") as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(full_path, "w") as f:
        f.write(content)

replace_in_file("src/components/nodes/BaseNode.tsx", [
    ("categoryColorMap[data.category] || '#fff'", "categoryColorMap[data.category as string] || '#fff'")
])

replace_in_file("src/lib/nodeRegistry.ts", [
    ("generateCode: (_node, inputs, outputVar) => {", "generateCode: (_node, _inputs, outputVar) => {"),
    ("generateCode: (_node, inputs) =>", "generateCode: (_node, inputs) =>"),
    ("node.data.config.filepath", "_node.data.config.filepath"),
    ("node.data.config.code", "_node.data.config.code")
])

print("Fixes applied.")
