const fs = require('fs');
const path = './src/lib/nodeRegistry.ts';
let code = fs.readFileSync(path, 'utf8');

// The issue is around `generateCode: (_node, inputs, outputVar) => `${outputVar} = """${_node.data.config.template}""".format(**(${inputs.variables || '{}'}))`,`
// This wasn't correctly formatted in JS because Python """ swallowed it.
// Let's rewrite prompt_template manually
code = code.replace(
  'generateCode: (_node, inputs, outputVar) => `${outputVar} = \\"\\"\\"${_node.data.config.template}\\"\\"\\".format(**(${inputs.variables || \'{}\'}))`',
  'generateCode: (_node, inputs, outputVar) => `${outputVar} = """${_node.data.config.template}""".format(**(${inputs.variables || \'{}\'}))`'
);

// We should just check the exact build errors:
// src/lib/nodeRegistry.ts(6,108): error TS1002: Unterminated string literal.
// Let's just output the file again cleanly from python without string problems.
