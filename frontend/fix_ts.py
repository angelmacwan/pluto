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

replace_in_file("src/App.tsx", [
    ("import { AuthProvider, useAuth } from './components/auth/AuthProvider';", "import { AuthProvider } from './components/auth/AuthProvider';")
])

replace_in_file("src/components/auth/LoginPage.tsx", [
    ("import React from 'react';", "")
])

replace_in_file("src/components/canvas/Canvas.tsx", [
    ("const { nodes, edges, setNodes, setEdges, addEdge, addNode } = useGraphStore();", "const { nodes, edges, setNodes, addEdge, addNode } = useGraphStore();")
])

replace_in_file("src/components/nodes/BaseNode.tsx", [
    ("import React from 'react';", ""),
    ("import { PlutoNodeData }", "import type { PlutoNodeData }"),
    ("const Icon = (LucideIcons as any)[data.icon || 'Code'] || LucideIcons.Code;", "const Icon = (LucideIcons as Record<string, any>)[data.icon || 'Code'] || LucideIcons.Code;")
])

replace_in_file("src/components/panels/CodePanel.tsx", [
    ("import React from 'react';", "")
])

replace_in_file("src/components/panels/OutputPanel.tsx", [
    ("import React from 'react';", "")
])

replace_in_file("src/components/ui/Toast.tsx", [
    ("import React from 'react';", "")
])

replace_in_file("src/components/ui/TopBar.tsx", [
    ("import React from 'react';", ""),
    ("import { useAuth, signOut } from '../auth/AuthProvider';", "import { signOut } from '../auth/AuthProvider';")
])

replace_in_file("src/lib/codegen.ts", [
    ("import { PlutoNode, PlutoEdge } from '../types';", "import type { PlutoNode, PlutoEdge } from '../types';"),
    ("const base = node.type.replace(/[^a-zA-Z0-9]/g, '_');", "const base = (node.type || 'node').replace(/[^a-zA-Z0-9]/g, '_');"),
    ("const def = nodeRegistry[node.type];", "const def = nodeRegistry[node.type || ''];"),
    ("def.imports.forEach(i => imports.add(i));", "def.imports.forEach((i: string) => imports.add(i));"),
    ("def.pipPackages.forEach(p => pipPackages.add(p));", "def.pipPackages.forEach((p: string) => pipPackages.add(p));")
])

replace_in_file("src/lib/nodeRegistry.ts", [
    ("import { NodeCategory, HandleDef, ConfigField, PlutoNode } from '../types';", "import type { NodeCategory, HandleDef, ConfigField, PlutoNode } from '../types';"),
    ("generateCode: (node, inputs, outputVar) => {", "generateCode: (_node, inputs, outputVar) => {"),
    ("generateCode: (node, inputs) =>", "generateCode: (_node, inputs) =>"),
    ("generateCode: (node, inputs, outputVar)", "generateCode: (_node, inputs, outputVar)"),
    ("const { type, value } = node.data.config;", "const { type, value } = _node.data.config;")
])

replace_in_file("src/pages/EditorPage.tsx", [
    ("import React from 'react';", "")
])

replace_in_file("src/pages/ProjectsPage.tsx", [
    ("import React, { useEffect } from 'react';", "import { useEffect } from 'react';")
])

replace_in_file("src/store/appStore.ts", [
    ("import { User as FirebaseUser } from 'firebase/auth';", "import type { User as FirebaseUser } from 'firebase/auth';"),
    ("import { Project } from '../types';", "import type { Project } from '../types';")
])

replace_in_file("src/store/graphStore.ts", [
    ("import { PlutoNode, PlutoEdge, NodeStatus, GraphState, PlutoNodeData } from '../types';", "import type { PlutoNode, PlutoEdge, NodeStatus, GraphState, PlutoNodeData } from '../types';"),
    ("import { Connection } from '@xyflow/react';", "import type { Connection } from '@xyflow/react';")
])

replace_in_file("src/store/projectStore.ts", [
    ("import { Project, GraphState } from '../types';", "import type { Project, GraphState } from '../types';"),
    ("export const useProjectStore = create<ProjectStore>((set) => ({", "export const useProjectStore = create<ProjectStore>((_set) => ({")
])

replace_in_file("src/types/index.ts", [
    ("import { Node, Edge } from '@xyflow/react';", "import type { Node, Edge } from '@xyflow/react';")
])

print("Fixes applied.")
