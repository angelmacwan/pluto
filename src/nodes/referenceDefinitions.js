// These definitions mirror the equivalent nodes in pluto_REFERENCE.  Keeping
// the schema and code generator together prevents the canvas UI and generated
// Python from getting out of sync.
export const referenceDefinitions = {
  Variable: {
    title: 'Variable', typeClass: 'node-type-variable', inputs: [], outputs: [{ id: 'out', label: 'value' }],
    fields: [
      { key: 'name', label: 'Variable Name', type: 'text', default: '', placeholder: 'optional' },
      { key: 'value', label: 'Value', type: 'text', default: 'None', placeholder: 'Python expression' },
    ],
    variableName: (config, fallback) => String(config.name || '').trim() || fallback,
    generate: (config, _inputs, output) => `${output} = ${config.value || 'None'}`,
  },
  Print: {
    title: 'Print / Debug', typeClass: 'node-type-output', inputs: [{ id: 'value', label: 'value', optional: true }], outputs: [],
    fields: [{ key: 'label', label: 'Label (optional)', type: 'text', default: '' }],
    generate: (config, inputs) => `print(${config.label ? `"${config.label}", ` : ''}${inputs.value || 'None'})`,
  },
  IfCondition: {
    title: 'If / Compare', typeClass: 'node-type-control',
    inputs: [{ id: 'value_a', label: 'value A' }, { id: 'value_b', label: 'value B' }],
    outputs: [{ id: 'true_branch', label: 'true', flow: true }, { id: 'false_branch', label: 'false', flow: true }],
    fields: [{ key: 'operator', label: 'Operator', type: 'select', options: ['==', '!=', '>', '<', '>=', '<=', 'is', 'is not', 'in', 'not in', 'not'], default: '==' }],
    generate: (config, inputs) => {
      const op = config.operator || '==';
      const a = inputs.value_a || inputs.value_b || 'None';
      // A single connected value is a truthiness check. Comparison is only
      // applied once the second input is actually connected.
      if (!inputs.value_a || !inputs.value_b) return op === 'not' ? `not ${a}` : a;
      return op === 'not' ? `not ${a}` : `${a} ${op} ${inputs.value_b}`;
    },
  },
  TypeCheck: {
    title: 'Type Check', typeClass: 'node-type-primitive', inputs: [{ id: 'value', label: 'value' }],
    outputs: [{ id: 'is_type', label: 'if match' }, { id: 'not_type', label: 'if no match' }, { id: 'type_name', label: 'type name' }],
    fields: [{ key: 'expected_type', label: 'Expected Type', type: 'select', options: ['str', 'int', 'float', 'bool', 'list', 'dict', 'tuple', 'set', 'bytes', 'NoneType', 'any'], default: 'str' }],
    generate: (config, inputs, output) => {
      const value = inputs.value || 'None';
      const type = { NoneType: 'type(None)', any: 'object' }[config.expected_type] || config.expected_type || 'str';
      return `${output}_type_name = type(${value}).__name__\n_match_${output} = isinstance(${value}, ${type})\n${output}_is_type = ${value} if _match_${output} else None\n${output}_not_type = ${value} if not _match_${output} else None`;
    },
  },
  ForLoop: {
    title: 'For Each', typeClass: 'node-type-control', inputs: [{ id: 'iterable', label: 'iterable' }], outputs: [{ id: 'results', label: 'results' }],
    fields: [{ key: 'body', label: 'Body (use item, index, and result)', type: 'textarea', default: 'result = item' }],
    generate: (config, inputs, output) => `${output} = []\nfor index, item in enumerate(${inputs.iterable || '[]'}):\n${String(config.body || 'result = item').split('\n').map(line => `    ${line}`).join('\n')}\n    ${output}.append(result)`,
  },
  FileRead: {
    title: 'File Read', typeClass: 'node-type-io', inputs: [], outputs: [{ id: 'content', label: 'content' }],
    fields: [{ key: 'filepath', label: 'File Path', type: 'text', default: 'data.txt' }, { key: 'mode', label: 'Mode', type: 'select', options: ['r', 'rb'], default: 'r' }],
    generate: (config, _inputs, output) => `with open("${config.filepath || 'data.txt'}", "${config.mode || 'r'}") as _f:\n    ${output} = _f.read()`,
  },
  FileWrite: {
    title: 'File Write', typeClass: 'node-type-io', inputs: [{ id: 'content', label: 'content' }, { id: 'filepath', label: 'filepath', optional: true }], outputs: [],
    fields: [{ key: 'filepath', label: 'File Path', type: 'text', default: 'output.txt' }],
    generate: (config, inputs) => `with open(${inputs.filepath || `"${config.filepath || 'output.txt'}"`}, 'w') as _f:\n    _f.write(str(${inputs.content || '""'}))`,
  },
  ImportLib: {
    title: 'Import Library', typeClass: 'node-type-primitive', inputs: [], outputs: [],
    fields: [{ key: 'import_statement', label: 'Import Statement', type: 'text', default: 'import numpy as np' }],
    generate: config => config.import_statement || '',
  },
};

export const isReferenceNode = type => Boolean(referenceDefinitions[type]);
