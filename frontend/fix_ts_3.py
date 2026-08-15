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

replace_in_file("src/lib/nodeRegistry.ts", [
    ("generateCode: (_node, inputs, outputVar) => `${outputVar}", "generateCode: (_node, _inputs, outputVar) => `${outputVar}"),
    ("let code = _node.data.config.code.replace(/\\\\b(in)\\\\b/g, inputs.in || 'None');", "let code = _node.data.config.code.replace(/\\\\b(in)\\\\b/g, _inputs.in || 'None');")
])

print("Fixes applied.")
