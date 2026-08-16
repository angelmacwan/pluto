import type { NodeCategory, HandleDef, ConfigField, PlutoNode } from '../types';

export interface NodeTypeDefinition {
  type: string;
  label: string;
  category: NodeCategory;
  description: string;
  icon: string;
  inputs: HandleDef[];
  outputs: HandleDef[];
  configSchema: ConfigField[];
  defaultConfig: Record<string, any>;
  generateCode: (node: PlutoNode, inputVars: Record<string, string>, outputVar: string) => string;
  imports: string[];
  pipPackages: string[];
}

export const nodeRegistry: Record<string, NodeTypeDefinition> = {
  // ─────────────────────────────────────────────
  // PRIMITIVES
  // ─────────────────────────────────────────────
  variable: {
    type: 'variable', label: 'Variable', category: 'primitive',
    description: 'Declare a named value using any valid Python expression',
    icon: 'Variable',
    inputs: [],
    outputs: [{ id: 'out', label: 'value', type: 'any' }],
    configSchema: [
      { key: 'name', label: 'Variable Name (optional)', type: 'string', default: '' },
      { key: 'value', label: 'Value (Python expression)', type: 'string', default: 'None' },
    ],
    defaultConfig: { name: '', value: 'None' },
    generateCode: (node, _inputs, outputVar) => `${outputVar} = ${node.data.config.value || 'None'}`,
    imports: [], pipPackages: [],
  },

  print_debug: {
    type: 'print_debug', label: 'Print / Debug', category: 'primitive',
    description: 'Print a value to stdout',
    icon: 'Terminal',
    inputs: [{ id: 'value', label: 'value', type: 'any', optional: true }],
    outputs: [],
    configSchema: [{ key: 'label', label: 'Label (optional)', type: 'string', default: '' }],
    defaultConfig: { label: '' },
    generateCode: (node, inputs) => {
      const lbl = node.data.config.label ? `"${node.data.config.label}", ` : '';
      return `print(${lbl}${inputs['value'] || 'None'})`;
    },
    imports: [], pipPackages: [],
  },

  if_condition: {
    type: 'if_condition', label: 'If / Compare', category: 'primitive',
    description: 'Compare two values and route program execution through the true or false path',
    icon: 'GitBranch',
    inputs: [
      { id: 'value_a', label: 'value A', type: 'any' },
      { id: 'value_b', label: 'value B', type: 'any' },
    ],
    outputs: [
      { id: 'condition',    label: 'output', type: 'bool' },
      { id: 'true_branch',  label: 'true',   type: 'flow' },
      { id: 'false_branch', label: 'false',  type: 'flow' },
    ],
    configSchema: [
      {
        key: 'operator',
        label: 'Operator',
        type: 'select',
        options: ['==', '!=', '>', '<', '>=', '<=', 'is', 'is not', 'in', 'not in', 'not'],
        default: '==',
      },
    ],
    defaultConfig: { operator: '==' },
    generateCode: (node, inputs, outputVar) => {
      const op  = node.data.config.operator ?? '==';
      const a   = inputs['value_a']  || 'None';
      const b   = inputs['value_b']  || 'None';
      // 'not' is a unary operator — ignore value_b
      const cond = op === 'not' ? `not ${a}` : `${a} ${op} ${b}`;
      return `${outputVar} = ${cond}`;
    },
    imports: [], pipPackages: [],
  },

  type_check: {
    type: 'type_check', label: 'Type Check', category: 'primitive',
    description: 'Check whether a value is an instance of a given type',
    icon: 'Microscope',
    inputs: [
      { id: 'value', label: 'value', type: 'any' },
    ],
    outputs: [
      { id: 'is_type',   label: 'if match',    type: 'any' },
      { id: 'not_type',  label: 'if no match', type: 'any' },
      { id: 'type_name', label: 'type name',   type: 'string' },
    ],
    configSchema: [
      {
        key: 'expected_type',
        label: 'Expected Type',
        type: 'select',
        options: ['str', 'int', 'float', 'bool', 'list', 'dict', 'tuple', 'set', 'bytes', 'NoneType', 'any'],
        default: 'str',
      },
    ],
    defaultConfig: { expected_type: 'str' },
    generateCode: (node, inputs, outputVar) => {
      const v   = inputs['value'] || 'None';
      const t   = node.data.config.expected_type ?? 'str';
      const typeMap: Record<string, string> = {
        str: 'str', int: 'int', float: 'float', bool: 'bool',
        list: 'list', dict: 'dict', tuple: 'tuple', set: 'set',
        bytes: 'bytes', NoneType: 'type(None)', any: 'object',
      };
      const pyType = typeMap[t] ?? t;
      return [
        `${outputVar}_type_name = type(${v}).__name__`,
        `_match_${outputVar} = isinstance(${v}, ${pyType})`,
        `${outputVar}_is_type  = ${v} if _match_${outputVar} else None`,
        `${outputVar}_not_type = ${v} if not _match_${outputVar} else None`,
      ].join('\n');
    },
    imports: [], pipPackages: [],
  },


  for_loop: {
    type: 'for_loop', label: 'For Each', category: 'primitive',
    description: 'Run a small Python body once per item and collect each result into a list',
    icon: 'Repeat',
    inputs: [{ id: 'iterable', label: 'iterable', type: 'list' }],
    outputs: [
      { id: 'results', label: 'results', type: 'list' },
    ],
    configSchema: [{ key: 'body', label: 'Body (use item, index, and result)', type: 'code', default: 'result = item' }],
    defaultConfig: { body: 'result = item' },
    generateCode: (node, inputs, outputVar) => {
      const body = String(node.data.config.body || 'result = item')
        .split('\n')
        .map((line: string) => `    ${line}`)
        .join('\n');
      return [`${outputVar} = []`, `for index, item in enumerate(${inputs['iterable'] || '[]'}):`, body, `    ${outputVar}.append(result)`].join('\n');
    },
    imports: [], pipPackages: [],
  },



  file_read: {
    type: 'file_read', label: 'File Read', category: 'primitive',
    description: 'Read a file from disk',
    icon: 'FileInput',
    inputs: [],
    outputs: [{ id: 'content', label: 'content', type: 'string' }],
    configSchema: [
      { key: 'filepath', label: 'File Path', type: 'string', default: 'data.txt' },
      { key: 'mode', label: 'Mode', type: 'select', options: ['r', 'rb'], default: 'r' },
    ],
    defaultConfig: { filepath: 'data.txt', mode: 'r' },
    generateCode: (node, _inputs, outputVar) => {
      const { filepath, mode } = node.data.config;
      return `with open("${filepath}", "${mode}") as _f:\n    ${outputVar} = _f.read()`;
    },
    imports: [], pipPackages: [],
  },

  file_write: {
    type: 'file_write', label: 'File Write', category: 'primitive',
    description: 'Write content to a file',
    icon: 'FileOutput',
    inputs: [
      { id: 'content', label: 'content', type: 'string' },
      { id: 'filepath', label: 'filepath', type: 'string', optional: true },
    ],
    outputs: [],
    configSchema: [{ key: 'filepath', label: 'File Path', type: 'string', default: 'output.txt' }],
    defaultConfig: { filepath: 'output.txt' },
    generateCode: (node, inputs) => {
      const fp = inputs['filepath'] ? inputs['filepath'] : `"${node.data.config.filepath}"`;
      return `with open(${fp}, 'w') as _f:\n    _f.write(str(${inputs['content'] || '""'}))`;
    },
    imports: [], pipPackages: [],
  },

  import_lib: {
    type: 'import_lib', label: 'Import Library', category: 'primitive',
    description: 'Import a Python library',
    icon: 'Package',
    inputs: [],
    outputs: [],
    configSchema: [{ key: 'import_statement', label: 'Import Statement', type: 'string', default: 'import numpy as np' }],
    defaultConfig: { import_statement: 'import numpy as np' },
    generateCode: (node) => node.data.config.import_statement || '',
    imports: [], pipPackages: [],
  },

  // ─────────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────────
  csv_loader: {
    type: 'csv_loader', label: 'CSV Loader', category: 'data',
    description: 'Load a CSV file into a DataFrame',
    icon: 'Sheet',
    inputs: [],
    outputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    configSchema: [{ key: 'filepath', label: 'File Path', type: 'string', default: 'data.csv' }],
    defaultConfig: { filepath: 'data.csv' },
    generateCode: (node, _inputs, outputVar) =>
      `${outputVar} = pd.read_csv("${node.data.config.filepath}")`,
    imports: ['import pandas as pd'], pipPackages: ['pandas'],
  },

  excel_loader: {
    type: 'excel_loader', label: 'Excel Loader', category: 'data',
    description: 'Load an Excel file into a DataFrame',
    icon: 'FileSpreadsheet',
    inputs: [],
    outputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    configSchema: [
      { key: 'filepath', label: 'File Path', type: 'string', default: 'data.xlsx' },
      { key: 'sheet_name', label: 'Sheet Name', type: 'string', default: 'Sheet1' },
    ],
    defaultConfig: { filepath: 'data.xlsx', sheet_name: 'Sheet1' },
    generateCode: (node, _inputs, outputVar) =>
      `${outputVar} = pd.read_excel("${node.data.config.filepath}", sheet_name="${node.data.config.sheet_name}")`,
    imports: ['import pandas as pd'], pipPackages: ['pandas', 'openpyxl'],
  },

  json_loader: {
    type: 'json_loader', label: 'JSON Loader', category: 'data',
    description: 'Load a JSON file',
    icon: 'FileJson',
    inputs: [],
    outputs: [{ id: 'data', label: 'data', type: 'dict' }],
    configSchema: [{ key: 'filepath', label: 'File Path', type: 'string', default: 'data.json' }],
    defaultConfig: { filepath: 'data.json' },
    generateCode: (node, _inputs, outputVar) =>
      `with open("${node.data.config.filepath}") as _f:\n    ${outputVar} = json.load(_f)`,
    imports: ['import json'], pipPackages: [],
  },

  api_fetch: {
    type: 'api_fetch', label: 'API Fetch', category: 'data',
    description: 'Make an HTTP request',
    icon: 'Globe',
    inputs: [],
    outputs: [{ id: 'response', label: 'response', type: 'dict' }],
    configSchema: [
      { key: 'url', label: 'URL', type: 'string', default: 'https://api.example.com/data' },
      { key: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], default: 'GET' },
      { key: 'headers', label: 'Headers (JSON)', type: 'textarea', default: '{}' },
    ],
    defaultConfig: { url: 'https://api.example.com/data', method: 'GET', headers: '{}' },
    generateCode: (node, _inputs, outputVar) => {
      const { url, method, headers } = node.data.config;
      return `_resp = requests.${(method || 'GET').toLowerCase()}("${url}", headers=${headers || '{}'})\n${outputVar} = _resp.json()`;
    },
    imports: ['import requests'], pipPackages: ['requests'],
  },

  df_filter: {
    type: 'df_filter', label: 'DataFrame Filter', category: 'data',
    description: 'Filter rows using a query expression',
    icon: 'Filter',
    inputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    outputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    configSchema: [{ key: 'query', label: 'Query Expression', type: 'string', default: 'column > 0' }],
    defaultConfig: { query: 'column > 0' },
    generateCode: (node, inputs, outputVar) =>
      `${outputVar} = ${inputs['df'] || 'df'}.query("${node.data.config.query}")`,
    imports: ['import pandas as pd'], pipPackages: ['pandas'],
  },

  col_select: {
    type: 'col_select', label: 'Column Select', category: 'data',
    description: 'Select specific columns',
    icon: 'Columns',
    inputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    outputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    configSchema: [{ key: 'columns', label: 'Columns (comma-separated)', type: 'string', default: 'col1, col2' }],
    defaultConfig: { columns: 'col1, col2' },
    generateCode: (node, inputs, outputVar) => {
      const cols = (node.data.config.columns || '').split(',').map((c: string) => `"${c.trim()}"`).join(', ');
      return `${outputVar} = ${inputs['df'] || 'df'}[[${cols}]]`;
    },
    imports: ['import pandas as pd'], pipPackages: ['pandas'],
  },

  col_drop: {
    type: 'col_drop', label: 'Column Drop', category: 'data',
    description: 'Drop specific columns',
    icon: 'Trash2',
    inputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    outputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    configSchema: [{ key: 'columns', label: 'Columns to Drop', type: 'string', default: 'col1' }],
    defaultConfig: { columns: 'col1' },
    generateCode: (node, inputs, outputVar) => {
      const cols = (node.data.config.columns || '').split(',').map((c: string) => `"${c.trim()}"`).join(', ');
      return `${outputVar} = ${inputs['df'] || 'df'}.drop(columns=[${cols}])`;
    },
    imports: ['import pandas as pd'], pipPackages: ['pandas'],
  },

  missing_imputer: {
    type: 'missing_imputer', label: 'Missing Value Imputer', category: 'data',
    description: 'Impute missing values',
    icon: 'Eraser',
    inputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    outputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    configSchema: [
      { key: 'strategy', label: 'Strategy', type: 'select', options: ['mean', 'median', 'most_frequent', 'constant'], default: 'mean' },
      { key: 'fill_value', label: 'Fill Value (for constant)', type: 'string', default: '0' },
    ],
    defaultConfig: { strategy: 'mean', fill_value: '0' },
    generateCode: (node, inputs, outputVar) => {
      const { strategy, fill_value } = node.data.config;
      const extra = strategy === 'constant' ? `, fill_value=${fill_value}` : '';
      return [
        `from sklearn.impute import SimpleImputer`,
        `_imp = SimpleImputer(strategy="${strategy}"${extra})`,
        `${outputVar} = pd.DataFrame(_imp.fit_transform(${inputs['df'] || 'df'}), columns=${inputs['df'] || 'df'}.columns)`,
      ].join('\n');
    },
    imports: ['import pandas as pd', 'from sklearn.impute import SimpleImputer'],
    pipPackages: ['pandas', 'scikit-learn'],
  },

  scaler: {
    type: 'scaler', label: 'Scaler', category: 'data',
    description: 'Scale numeric features',
    icon: 'ArrowsUpFromLine',
    inputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    outputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    configSchema: [
      { key: 'scaler_type', label: 'Scaler Type', type: 'select', options: ['standard', 'minmax', 'robust'], default: 'standard' },
    ],
    defaultConfig: { scaler_type: 'standard' },
    generateCode: (node, inputs, outputVar) => {
      const t = node.data.config.scaler_type || 'standard';
      const cls = t === 'standard' ? 'StandardScaler' : t === 'minmax' ? 'MinMaxScaler' : 'RobustScaler';
      const imp = t === 'standard' ? 'StandardScaler' : t === 'minmax' ? 'MinMaxScaler' : 'RobustScaler';
      return `from sklearn.preprocessing import ${imp}\n_scaler = ${cls}()\n${outputVar} = pd.DataFrame(_scaler.fit_transform(${inputs['df'] || 'df'}), columns=${inputs['df'] || 'df'}.columns)`;
    },
    imports: ['import pandas as pd'],
    pipPackages: ['pandas', 'scikit-learn'],
  },

  encoder: {
    type: 'encoder', label: 'Encoder', category: 'data',
    description: 'Encode categorical features',
    icon: 'Tag',
    inputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    outputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    configSchema: [
      { key: 'enc_type', label: 'Encoder Type', type: 'select', options: ['onehot', 'label'], default: 'onehot' },
      { key: 'columns', label: 'Columns (comma-separated)', type: 'string', default: 'category_col' },
    ],
    defaultConfig: { enc_type: 'onehot', columns: 'category_col' },
    generateCode: (node, inputs, outputVar) => {
      const { enc_type, columns } = node.data.config;
      const cols = (columns || '').split(',').map((c: string) => `"${c.trim()}"`).join(', ');
      if (enc_type === 'label') {
        return `from sklearn.preprocessing import LabelEncoder\n_le = LabelEncoder()\n${outputVar} = ${inputs['df'] || 'df'}.copy()\nfor _col in [${cols}]:\n    ${outputVar}[_col] = _le.fit_transform(${outputVar}[_col])`;
      }
      return `${outputVar} = pd.get_dummies(${inputs['df'] || 'df'}, columns=[${cols}])`;
    },
    imports: ['import pandas as pd'],
    pipPackages: ['pandas', 'scikit-learn'],
  },

  train_test_split: {
    type: 'train_test_split', label: 'Train/Test Split', category: 'data',
    description: 'Split data into train and test sets',
    icon: 'Scissors',
    inputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    outputs: [
      { id: 'X_train', label: 'X_train', type: 'dataframe' },
      { id: 'X_test', label: 'X_test', type: 'dataframe' },
      { id: 'y_train', label: 'y_train', type: 'dataframe' },
      { id: 'y_test', label: 'y_test', type: 'dataframe' },
    ],
    configSchema: [
      { key: 'target_col', label: 'Target Column', type: 'string', default: 'label' },
      { key: 'test_size', label: 'Test Size', type: 'number', default: 0.2 },
      { key: 'random_state', label: 'Random State', type: 'number', default: 42 },
    ],
    defaultConfig: { target_col: 'label', test_size: 0.2, random_state: 42 },
    generateCode: (node, inputs, outputVar) => {
      const { target_col, test_size, random_state } = node.data.config;
      const df = inputs['df'] || 'df';
      return [
        `_X = ${df}.drop(columns=["${target_col}"])`,
        `_y = ${df}["${target_col}"]`,
        `${outputVar}_X_train, ${outputVar}_X_test, ${outputVar}_y_train, ${outputVar}_y_test = train_test_split(_X, _y, test_size=${test_size || 0.2}, random_state=${random_state || 42})`,
      ].join('\n');
    },
    imports: ['import pandas as pd', 'from sklearn.model_selection import train_test_split'],
    pipPackages: ['pandas', 'scikit-learn'],
  },

  df_merge: {
    type: 'df_merge', label: 'DataFrame Merge', category: 'data',
    description: 'Merge two DataFrames',
    icon: 'Merge',
    inputs: [
      { id: 'left', label: 'left df', type: 'dataframe' },
      { id: 'right', label: 'right df', type: 'dataframe' },
    ],
    outputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    configSchema: [
      { key: 'on', label: 'Join Key (column)', type: 'string', default: 'id' },
      { key: 'how', label: 'How', type: 'select', options: ['inner', 'left', 'right', 'outer'], default: 'inner' },
    ],
    defaultConfig: { on: 'id', how: 'inner' },
    generateCode: (node, inputs, outputVar) =>
      `${outputVar} = pd.merge(${inputs['left'] || 'left_df'}, ${inputs['right'] || 'right_df'}, on="${node.data.config.on}", how="${node.data.config.how}")`,
    imports: ['import pandas as pd'], pipPackages: ['pandas'],
  },

  df_groupby: {
    type: 'df_groupby', label: 'Group By / Aggregate', category: 'data',
    description: 'Group and aggregate a DataFrame',
    icon: 'Group',
    inputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    outputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    configSchema: [
      { key: 'by', label: 'Group By Column', type: 'string', default: 'category' },
      { key: 'agg', label: 'Aggregation', type: 'select', options: ['mean', 'sum', 'count', 'max', 'min'], default: 'mean' },
    ],
    defaultConfig: { by: 'category', agg: 'mean' },
    generateCode: (node, inputs, outputVar) =>
      `${outputVar} = ${inputs['df'] || 'df'}.groupby("${node.data.config.by}").${node.data.config.agg || 'mean'}().reset_index()`,
    imports: ['import pandas as pd'], pipPackages: ['pandas'],
  },

  df_sort: {
    type: 'df_sort', label: 'Sort', category: 'data',
    description: 'Sort a DataFrame by column',
    icon: 'ArrowUpDown',
    inputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    outputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    configSchema: [
      { key: 'by', label: 'Sort By Column', type: 'string', default: 'value' },
      { key: 'ascending', label: 'Ascending', type: 'bool', default: 'true' },
    ],
    defaultConfig: { by: 'value', ascending: 'true' },
    generateCode: (node, inputs, outputVar) => {
      const asc = node.data.config.ascending === 'false' || node.data.config.ascending === false ? 'False' : 'True';
      return `${outputVar} = ${inputs['df'] || 'df'}.sort_values("${node.data.config.by}", ascending=${asc})`;
    },
    imports: ['import pandas as pd'], pipPackages: ['pandas'],
  },

  // ─────────────────────────────────────────────
  // ML
  // ─────────────────────────────────────────────
  linear_regression: {
    type: 'linear_regression', label: 'Linear Regression', category: 'ml',
    description: 'Sklearn linear regression model',
    icon: 'TrendingUp',
    inputs: [],
    outputs: [{ id: 'model', label: 'model', type: 'model' }],
    configSchema: [{ key: 'fit_intercept', label: 'Fit Intercept', type: 'bool', default: 'true' }],
    defaultConfig: { fit_intercept: 'true' },
    generateCode: (node, _inputs, outputVar) =>
      `${outputVar} = LinearRegression(fit_intercept=${node.data.config.fit_intercept === 'false' ? 'False' : 'True'})`,
    imports: ['from sklearn.linear_model import LinearRegression'], pipPackages: ['scikit-learn'],
  },

  logistic_regression: {
    type: 'logistic_regression', label: 'Logistic Regression', category: 'ml',
    description: 'Sklearn logistic regression classifier',
    icon: 'GitFork',
    inputs: [],
    outputs: [{ id: 'model', label: 'model', type: 'model' }],
    configSchema: [{ key: 'max_iter', label: 'Max Iterations', type: 'number', default: 1000 }],
    defaultConfig: { max_iter: 1000 },
    generateCode: (node, _inputs, outputVar) =>
      `${outputVar} = LogisticRegression(max_iter=${node.data.config.max_iter || 1000})`,
    imports: ['from sklearn.linear_model import LogisticRegression'], pipPackages: ['scikit-learn'],
  },

  decision_tree: {
    type: 'decision_tree', label: 'Decision Tree', category: 'ml',
    description: 'Decision tree classifier',
    icon: 'Binary',
    inputs: [],
    outputs: [{ id: 'model', label: 'model', type: 'model' }],
    configSchema: [{ key: 'max_depth', label: 'Max Depth', type: 'number', default: 5 }],
    defaultConfig: { max_depth: 5 },
    generateCode: (node, _inputs, outputVar) =>
      `${outputVar} = DecisionTreeClassifier(max_depth=${node.data.config.max_depth || 5})`,
    imports: ['from sklearn.tree import DecisionTreeClassifier'], pipPackages: ['scikit-learn'],
  },

  random_forest: {
    type: 'random_forest', label: 'Random Forest', category: 'ml',
    description: 'Random forest classifier/regressor',
    icon: 'Trees',
    inputs: [],
    outputs: [{ id: 'model', label: 'model', type: 'model' }],
    configSchema: [
      { key: 'n_estimators', label: 'N Estimators', type: 'number', default: 100 },
      { key: 'max_depth', label: 'Max Depth', type: 'number', default: 10 },
    ],
    defaultConfig: { n_estimators: 100, max_depth: 10 },
    generateCode: (node, _inputs, outputVar) =>
      `${outputVar} = RandomForestClassifier(n_estimators=${node.data.config.n_estimators || 100}, max_depth=${node.data.config.max_depth || 10})`,
    imports: ['from sklearn.ensemble import RandomForestClassifier'], pipPackages: ['scikit-learn'],
  },

  svm: {
    type: 'svm', label: 'SVM', category: 'ml',
    description: 'Support Vector Machine classifier',
    icon: 'Maximize2',
    inputs: [],
    outputs: [{ id: 'model', label: 'model', type: 'model' }],
    configSchema: [
      { key: 'kernel', label: 'Kernel', type: 'select', options: ['rbf', 'linear', 'poly'], default: 'rbf' },
      { key: 'C', label: 'C (Regularization)', type: 'number', default: 1.0 },
    ],
    defaultConfig: { kernel: 'rbf', C: 1.0 },
    generateCode: (node, _inputs, outputVar) =>
      `${outputVar} = SVC(kernel="${node.data.config.kernel || 'rbf'}", C=${node.data.config.C || 1.0})`,
    imports: ['from sklearn.svm import SVC'], pipPackages: ['scikit-learn'],
  },

  knn: {
    type: 'knn', label: 'K-Nearest Neighbors', category: 'ml',
    description: 'KNN classifier',
    icon: 'Network',
    inputs: [],
    outputs: [{ id: 'model', label: 'model', type: 'model' }],
    configSchema: [{ key: 'n_neighbors', label: 'N Neighbors', type: 'number', default: 5 }],
    defaultConfig: { n_neighbors: 5 },
    generateCode: (node, _inputs, outputVar) =>
      `${outputVar} = KNeighborsClassifier(n_neighbors=${node.data.config.n_neighbors || 5})`,
    imports: ['from sklearn.neighbors import KNeighborsClassifier'], pipPackages: ['scikit-learn'],
  },

  gradient_boosting: {
    type: 'gradient_boosting', label: 'Gradient Boosting', category: 'ml',
    description: 'Gradient boosting classifier',
    icon: 'Zap',
    inputs: [],
    outputs: [{ id: 'model', label: 'model', type: 'model' }],
    configSchema: [
      { key: 'n_estimators', label: 'N Estimators', type: 'number', default: 100 },
      { key: 'learning_rate', label: 'Learning Rate', type: 'number', default: 0.1 },
    ],
    defaultConfig: { n_estimators: 100, learning_rate: 0.1 },
    generateCode: (node, _inputs, outputVar) =>
      `${outputVar} = GradientBoostingClassifier(n_estimators=${node.data.config.n_estimators || 100}, learning_rate=${node.data.config.learning_rate || 0.1})`,
    imports: ['from sklearn.ensemble import GradientBoostingClassifier'], pipPackages: ['scikit-learn'],
  },

  xgboost: {
    type: 'xgboost', label: 'XGBoost', category: 'ml',
    description: 'XGBoost classifier',
    icon: 'Rocket',
    inputs: [],
    outputs: [{ id: 'model', label: 'model', type: 'model' }],
    configSchema: [
      { key: 'n_estimators', label: 'N Estimators', type: 'number', default: 100 },
      { key: 'learning_rate', label: 'Learning Rate', type: 'number', default: 0.1 },
      { key: 'max_depth', label: 'Max Depth', type: 'number', default: 6 },
    ],
    defaultConfig: { n_estimators: 100, learning_rate: 0.1, max_depth: 6 },
    generateCode: (node, _inputs, outputVar) =>
      `${outputVar} = xgb.XGBClassifier(n_estimators=${node.data.config.n_estimators || 100}, learning_rate=${node.data.config.learning_rate || 0.1}, max_depth=${node.data.config.max_depth || 6})`,
    imports: ['import xgboost as xgb'], pipPackages: ['xgboost'],
  },

  kmeans: {
    type: 'kmeans', label: 'K-Means Clustering', category: 'ml',
    description: 'K-Means clustering algorithm',
    icon: 'CircleDot',
    inputs: [],
    outputs: [{ id: 'model', label: 'model', type: 'model' }],
    configSchema: [
      { key: 'n_clusters', label: 'N Clusters', type: 'number', default: 3 },
      { key: 'random_state', label: 'Random State', type: 'number', default: 42 },
    ],
    defaultConfig: { n_clusters: 3, random_state: 42 },
    generateCode: (node, _inputs, outputVar) =>
      `${outputVar} = KMeans(n_clusters=${node.data.config.n_clusters || 3}, random_state=${node.data.config.random_state || 42})`,
    imports: ['from sklearn.cluster import KMeans'], pipPackages: ['scikit-learn'],
  },

  dbscan: {
    type: 'dbscan', label: 'DBSCAN', category: 'ml',
    description: 'DBSCAN density-based clustering',
    icon: 'Layers',
    inputs: [],
    outputs: [{ id: 'model', label: 'model', type: 'model' }],
    configSchema: [
      { key: 'eps', label: 'Epsilon', type: 'number', default: 0.5 },
      { key: 'min_samples', label: 'Min Samples', type: 'number', default: 5 },
    ],
    defaultConfig: { eps: 0.5, min_samples: 5 },
    generateCode: (node, _inputs, outputVar) =>
      `${outputVar} = DBSCAN(eps=${node.data.config.eps || 0.5}, min_samples=${node.data.config.min_samples || 5})`,
    imports: ['from sklearn.cluster import DBSCAN'], pipPackages: ['scikit-learn'],
  },

  model_trainer: {
    type: 'model_trainer', label: 'Model Trainer', category: 'ml',
    description: 'Fit a model on training data',
    icon: 'Play',
    inputs: [
      { id: 'model', label: 'model', type: 'model' },
      { id: 'X_train', label: 'X_train', type: 'dataframe' },
      { id: 'y_train', label: 'y_train', type: 'dataframe' },
    ],
    outputs: [{ id: 'trained_model', label: 'trained model', type: 'model' }],
    configSchema: [],
    defaultConfig: {},
    generateCode: (_node, inputs, outputVar) =>
      `${outputVar} = ${inputs['model'] || 'model'}\n${outputVar}.fit(${inputs['X_train'] || 'X_train'}, ${inputs['y_train'] || 'y_train'})`,
    imports: [], pipPackages: ['scikit-learn'],
  },

  model_predict: {
    type: 'model_predict', label: 'Model Predict', category: 'ml',
    description: 'Generate predictions from a trained model',
    icon: 'ChevronRight',
    inputs: [
      { id: 'model', label: 'trained model', type: 'model' },
      { id: 'X', label: 'X', type: 'dataframe' },
    ],
    outputs: [{ id: 'predictions', label: 'predictions', type: 'dataframe' }],
    configSchema: [],
    defaultConfig: {},
    generateCode: (_node, inputs, outputVar) =>
      `${outputVar} = ${inputs['model'] || 'model'}.predict(${inputs['X'] || 'X'})`,
    imports: [], pipPackages: ['scikit-learn'],
  },

  cross_validator: {
    type: 'cross_validator', label: 'Cross-Validator', category: 'ml',
    description: 'Cross-validate model performance',
    icon: 'RefreshCw',
    inputs: [
      { id: 'model', label: 'model', type: 'model' },
      { id: 'X', label: 'X', type: 'dataframe' },
      { id: 'y', label: 'y', type: 'dataframe' },
    ],
    outputs: [{ id: 'scores', label: 'scores', type: 'list' }],
    configSchema: [{ key: 'cv', label: 'CV Folds', type: 'number', default: 5 }],
    defaultConfig: { cv: 5 },
    generateCode: (node, inputs, outputVar) =>
      `${outputVar} = cross_val_score(${inputs['model'] || 'model'}, ${inputs['X'] || 'X'}, ${inputs['y'] || 'y'}, cv=${node.data.config.cv || 5}).tolist()\nprint("CV scores:", ${outputVar})`,
    imports: ['from sklearn.model_selection import cross_val_score'], pipPackages: ['scikit-learn'],
  },

  hyperparameter_tuner: {
    type: 'hyperparameter_tuner', label: 'Hyperparameter Tuner', category: 'ml',
    description: 'Grid or random search for best params',
    icon: 'SlidersHorizontal',
    inputs: [
      { id: 'model', label: 'model', type: 'model' },
      { id: 'X', label: 'X', type: 'dataframe' },
      { id: 'y', label: 'y', type: 'dataframe' },
    ],
    outputs: [{ id: 'best_model', label: 'best model', type: 'model' }],
    configSchema: [
      { key: 'param_grid', label: 'Param Grid (JSON)', type: 'textarea', default: '{"C": [0.1, 1, 10]}' },
      { key: 'search', label: 'Search Type', type: 'select', options: ['grid', 'random'], default: 'grid' },
    ],
    defaultConfig: { param_grid: '{"C": [0.1, 1, 10]}', search: 'grid' },
    generateCode: (node, inputs, outputVar) => {
      const { param_grid, search } = node.data.config;
      const cls = search === 'random' ? 'RandomizedSearchCV' : 'GridSearchCV';
      return `_search = ${cls}(${inputs['model'] || 'model'}, ${param_grid || '{}'}, cv=5)\n_search.fit(${inputs['X'] || 'X'}, ${inputs['y'] || 'y'})\n${outputVar} = _search.best_estimator_\nprint("Best params:", _search.best_params_)`;
    },
    imports: ['from sklearn.model_selection import GridSearchCV, RandomizedSearchCV'], pipPackages: ['scikit-learn'],
  },

  // ─────────────────────────────────────────────
  // DEEP LEARNING (PyTorch)
  // ─────────────────────────────────────────────
  nn_linear: {
    type: 'nn_linear', label: 'Linear Layer', category: 'dl',
    description: 'PyTorch linear (fully connected) layer',
    icon: 'Minus',
    inputs: [],
    outputs: [{ id: 'layer', label: 'layer', type: 'model' }],
    configSchema: [
      { key: 'in_features', label: 'In Features', type: 'number', default: 128 },
      { key: 'out_features', label: 'Out Features', type: 'number', default: 64 },
      { key: 'activation', label: 'Activation', type: 'select', options: ['relu', 'sigmoid', 'tanh', 'none'], default: 'relu' },
    ],
    defaultConfig: { in_features: 128, out_features: 64, activation: 'relu' },
    generateCode: (node, _inputs, outputVar) => {
      const { in_features, out_features, activation } = node.data.config;
      const act = activation === 'none' ? '' : `, nn.${activation === 'relu' ? 'ReLU' : activation === 'sigmoid' ? 'Sigmoid' : 'Tanh'}()`;
      return `${outputVar} = nn.Sequential(nn.Linear(${in_features || 128}, ${out_features || 64})${act})`;
    },
    imports: ['import torch', 'import torch.nn as nn'], pipPackages: ['torch'],
  },

  nn_sequential: {
    type: 'nn_sequential', label: 'Sequential Model', category: 'dl',
    description: 'PyTorch sequential neural network',
    icon: 'LayoutList',
    inputs: [],
    outputs: [{ id: 'model', label: 'model', type: 'model' }],
    configSchema: [
      { key: 'layers_config', label: 'One layer per line', type: 'textarea', default: 'Linear(128, 64)\nReLU()\nLinear(64, 10)' },
    ],
    defaultConfig: { layers_config: 'Linear(128, 64)\nReLU()\nLinear(64, 10)' },
    generateCode: (node, _inputs, outputVar) =>
      `${outputVar} = nn.Sequential(\n    nn.${String(node.data.config.layers_config || 'Linear(128, 10)').split('\n').filter(Boolean).map((layer: string) => layer.trim()).join(',\n    nn.')}\n)`,
    imports: ['import torch', 'import torch.nn as nn'], pipPackages: ['torch'],
  },

  training_loop: {
    type: 'training_loop', label: 'Training Loop', category: 'dl',
    description: 'Train a PyTorch model',
    icon: 'RotateCw',
    inputs: [
      { id: 'model', label: 'model', type: 'model' },
      { id: 'X_train', label: 'X_train', type: 'dataframe' },
      { id: 'y_train', label: 'y_train', type: 'dataframe' },
    ],
    outputs: [{ id: 'trained_model', label: 'trained model', type: 'model' }],
    configSchema: [
      { key: 'epochs', label: 'Epochs', type: 'number', default: 10 },
      { key: 'lr', label: 'Learning Rate', type: 'number', default: 0.001 },
      { key: 'optimizer', label: 'Optimizer', type: 'select', options: ['adam', 'sgd'], default: 'adam' },
      { key: 'loss', label: 'Loss Function', type: 'select', options: ['mse', 'cross_entropy'], default: 'mse' },
    ],
    defaultConfig: { epochs: 10, lr: 0.001, optimizer: 'adam', loss: 'mse' },
    generateCode: (node, inputs, outputVar) => {
      const { epochs, lr, optimizer, loss } = node.data.config;
      const optCls = optimizer === 'sgd' ? 'SGD' : 'Adam';
      const lossFn = loss === 'cross_entropy' ? 'CrossEntropyLoss' : 'MSELoss';
      return [
        `import numpy as np`,
        `${outputVar} = ${inputs['model'] || 'model'}`,
        `_X_t = torch.FloatTensor(np.array(${inputs['X_train'] || 'X_train'}))`,
        `_y_t = torch.FloatTensor(np.array(${inputs['y_train'] || 'y_train'}))`,
        `_optimizer = optim.${optCls}(${outputVar}.parameters(), lr=${lr || 0.001})`,
        `_criterion = nn.${lossFn}()`,
        `for _epoch in range(${epochs || 10}):`,
        `    _optimizer.zero_grad()`,
        `    _output = ${outputVar}(_X_t)`,
        `    _loss = _criterion(_output, _y_t)`,
        `    _loss.backward()`,
        `    _optimizer.step()`,
        `    if (_epoch + 1) % 2 == 0:`,
        `        print(f"Epoch [{_epoch+1}/${epochs || 10}] Loss: {_loss.item():.4f}")`,
      ].join('\n');
    },
    imports: ['import torch', 'import torch.nn as nn', 'import torch.optim as optim', 'import numpy as np'],
    pipPackages: ['torch', 'numpy'],
  },

  model_save: {
    type: 'model_save', label: 'Model Save', category: 'dl',
    description: 'Save a PyTorch model to disk',
    icon: 'Save',
    inputs: [{ id: 'model', label: 'model', type: 'model' }],
    outputs: [],
    configSchema: [{ key: 'filepath', label: 'File Path', type: 'string', default: 'model.pth' }],
    defaultConfig: { filepath: 'model.pth' },
    generateCode: (node, inputs) =>
      `torch.save(${inputs['model'] || 'model'}.state_dict(), "${node.data.config.filepath || 'model.pth'}")`,
    imports: ['import torch'], pipPackages: ['torch'],
  },

  model_load: {
    type: 'model_load', label: 'TorchScript Model Load', category: 'dl',
    description: 'Load a self-contained TorchScript model from disk',
    icon: 'FolderOpen',
    inputs: [],
    outputs: [{ id: 'model', label: 'model', type: 'model' }],
    configSchema: [{ key: 'filepath', label: 'File Path', type: 'string', default: 'model.pth' }],
    defaultConfig: { filepath: 'model.pth' },
    generateCode: (node, _inputs, outputVar) =>
      `${outputVar} = torch.jit.load("${node.data.config.filepath || 'model.pth'}", map_location="cpu")\n${outputVar}.eval()`,
    imports: ['import torch'], pipPackages: ['torch'],
  },

  model_infer: {
    type: 'model_infer', label: 'Model Inference', category: 'dl',
    description: 'Run inference on a PyTorch model',
    icon: 'BrainCircuit',
    inputs: [
      { id: 'model', label: 'model', type: 'model' },
      { id: 'X', label: 'X', type: 'dataframe' },
    ],
    outputs: [{ id: 'predictions', label: 'predictions', type: 'dataframe' }],
    configSchema: [],
    defaultConfig: {},
    generateCode: (_node, inputs, outputVar) => [
      `import numpy as np`,
      `${inputs['model'] || 'model'}.eval()`,
      `with torch.no_grad():`,
      `    _X_t = torch.FloatTensor(np.array(${inputs['X'] || 'X'}))`,
      `    ${outputVar} = ${inputs['model'] || 'model'}(_X_t).numpy()`,
    ].join('\n'),
    imports: ['import torch', 'import numpy as np'], pipPackages: ['torch', 'numpy'],
  },

  // ─────────────────────────────────────────────
  // AGENT
  // ─────────────────────────────────────────────
  llm_call: {
    type: 'llm_call', label: 'LLM Call', category: 'agent',
    description: 'Call an LLM provider (OpenAI, Anthropic, Google)',
    icon: 'MessageSquare',
    inputs: [{ id: 'prompt', label: 'prompt', type: 'string' }],
    outputs: [{ id: 'response', label: 'response', type: 'string' }],
    configSchema: [
      { key: 'provider', label: 'Provider', type: 'select', options: ['openai', 'anthropic', 'google'], default: 'openai' },
      { key: 'model', label: 'Model', type: 'string', default: 'gpt-4o' },
      { key: 'api_key_env', label: 'API Key Env Var', type: 'string', default: 'OPENAI_API_KEY' },
      { key: 'temperature', label: 'Temperature', type: 'number', default: 0.7 },
    ],
    defaultConfig: { provider: 'openai', model: 'gpt-4o', api_key_env: 'OPENAI_API_KEY', temperature: 0.7 },
    generateCode: (node, inputs, outputVar) => {
      const { provider, model, api_key_env, temperature } = node.data.config;
      const prompt = inputs['prompt'] || '"Hello!"';
      if (provider === 'anthropic') {
        return [
          `import anthropic as _anthropic_lib`,
          `_client = _anthropic_lib.Anthropic(api_key=os.environ["${api_key_env || 'ANTHROPIC_API_KEY'}"])`,
          `_msg = _client.messages.create(model="${model || 'claude-3-5-sonnet-20241022'}", max_tokens=1024, messages=[{"role":"user","content":${prompt}}])`,
          `${outputVar} = _msg.content[0].text`,
        ].join('\n');
      } else if (provider === 'google') {
        return [
          `import google.generativeai as genai`,
          `genai.configure(api_key=os.environ["${api_key_env || 'GOOGLE_API_KEY'}"])`,
          `_gmodel = genai.GenerativeModel("${model || 'gemini-1.5-pro'}")`,
          `${outputVar} = _gmodel.generate_content(${prompt}).text`,
        ].join('\n');
      }
      return [
        `from openai import OpenAI as _OAI`,
        `_oai_client = _OAI(api_key=os.environ["${api_key_env || 'OPENAI_API_KEY'}"])`,
        `_completion = _oai_client.chat.completions.create(model="${model || 'gpt-4o'}", temperature=${temperature || 0.7}, messages=[{"role":"user","content":${prompt}}])`,
        `${outputVar} = _completion.choices[0].message.content`,
      ].join('\n');
    },
    imports: ['import os'], pipPackages: ['openai'],
  },

  prompt_template: {
    type: 'prompt_template', label: 'Prompt Template', category: 'agent',
    description: 'Fill a prompt template with variables',
    icon: 'FileText',
    inputs: [{ id: 'variables', label: 'variables (dict)', type: 'dict', optional: true }],
    outputs: [{ id: 'prompt', label: 'prompt', type: 'string' }],
    configSchema: [{ key: 'template', label: 'Template ({var} syntax)', type: 'textarea', default: 'Answer this question: {question}' }],
    defaultConfig: { template: 'Answer this question: {question}' },
    generateCode: (node, inputs, outputVar) =>
      `${outputVar} = """${node.data.config.template || ''}""".format(**(${inputs['variables'] || '{}'}))`,
    imports: [], pipPackages: [],
  },

  memory_node: {
    type: 'memory_node', label: 'Memory / Context', category: 'agent',
    description: 'Maintain conversation history',
    icon: 'BookOpen',
    inputs: [{ id: 'message', label: 'message', type: 'string' }],
    outputs: [{ id: 'context', label: 'context (list)', type: 'list' }],
    configSchema: [{ key: 'max_history', label: 'Max History', type: 'number', default: 10 }],
    defaultConfig: { max_history: 10 },
    generateCode: (node, inputs, outputVar) => [
      `if "${outputVar}" not in dir():`,
      `    ${outputVar} = []`,
      `${outputVar}.append({"role": "user", "content": ${inputs['message'] || '""'}})`,
      `${outputVar} = ${outputVar}[-${node.data.config.max_history || 10}:]`,
    ].join('\n'),
    imports: [], pipPackages: [],
  },

  agent_loop: {
    type: 'agent_loop', label: 'Agent Loop', category: 'agent',
    description: 'ReAct-style agent loop',
    icon: 'Bot',
    inputs: [{ id: 'goal', label: 'goal', type: 'string' }],
    outputs: [{ id: 'result', label: 'result', type: 'string' }],
    configSchema: [
      { key: 'max_iterations', label: 'Max Iterations', type: 'number', default: 10 },
      { key: 'model', label: 'Model', type: 'string', default: 'gpt-4o' },
      { key: 'api_key_env', label: 'API Key Env Var', type: 'string', default: 'OPENAI_API_KEY' },
    ],
    defaultConfig: { max_iterations: 10, model: 'gpt-4o', api_key_env: 'OPENAI_API_KEY' },
    generateCode: (node, inputs, outputVar) => {
      const { max_iterations, model, api_key_env } = node.data.config;
      return [
        `import os`,
        `from openai import OpenAI as _OAI`,
        `_agent_client = _OAI(api_key=os.environ["${api_key_env || 'OPENAI_API_KEY'}"])`,
        `_messages = [{"role": "system", "content": "You are a helpful agent. Think step by step."},`,
        `             {"role": "user", "content": ${inputs['goal'] || '"Complete the task"'}}]`,
        `${outputVar} = ""`,
        `for _iter in range(${max_iterations || 10}):`,
        `    _resp = _agent_client.chat.completions.create(model="${model || 'gpt-4o'}", messages=_messages)`,
        `    _agent_reply = _resp.choices[0].message.content`,
        `    _messages.append({"role": "assistant", "content": _agent_reply})`,
        `    if "DONE" in _agent_reply or "FINAL ANSWER" in _agent_reply:`,
        `        ${outputVar} = _agent_reply`,
        `        break`,
        `    ${outputVar} = _agent_reply`,
        `print("Agent result:", ${outputVar})`,
      ].join('\n');
    },
    imports: ['import os'], pipPackages: ['openai'],
  },

  structured_output: {
    type: 'structured_output', label: 'Structured Output', category: 'agent',
    description: 'Extract structured JSON from an LLM',
    icon: 'Braces',
    inputs: [{ id: 'prompt', label: 'prompt', type: 'string' }],
    outputs: [{ id: 'result', label: 'result (dict)', type: 'dict' }],
    configSchema: [
      { key: 'model', label: 'Model', type: 'string', default: 'gpt-4o' },
      { key: 'schema', label: 'Output Schema (JSON)', type: 'textarea', default: '{"name": "string", "value": "number"}' },
      { key: 'api_key_env', label: 'API Key Env Var', type: 'string', default: 'OPENAI_API_KEY' },
    ],
    defaultConfig: { model: 'gpt-4o', schema: '{"name": "string"}', api_key_env: 'OPENAI_API_KEY' },
    generateCode: (node, inputs, outputVar) => {
      const { model, schema, api_key_env } = node.data.config;
      return [
        `import json as _json, os`,
        `from openai import OpenAI as _OAI`,
        `_so_client = _OAI(api_key=os.environ["${api_key_env || 'OPENAI_API_KEY'}"])`,
        `_so_resp = _so_client.chat.completions.create(`,
        `    model="${model || 'gpt-4o'}", response_format={"type": "json_object"},`,
        `    messages=[{"role": "system", "content": "Respond with JSON matching: ${(schema || '{}').replace(/"/g, '\\"')}"},`,
        `               {"role": "user", "content": ${inputs['prompt'] || '""'}}])`,
        `${outputVar} = _json.loads(_so_resp.choices[0].message.content)`,
      ].join('\n');
    },
    imports: ['import json', 'import os'], pipPackages: ['openai'],
  },

  // ─────────────────────────────────────────────
  // EVAL & VISUALIZATION
  // ─────────────────────────────────────────────
  classification_report: {
    type: 'classification_report', label: 'Classification Report', category: 'eval',
    description: 'Print precision, recall, F1 per class',
    icon: 'ClipboardList',
    inputs: [
      { id: 'y_true', label: 'y_true', type: 'dataframe' },
      { id: 'y_pred', label: 'y_pred', type: 'dataframe' },
    ],
    outputs: [{ id: 'report', label: 'report', type: 'string' }],
    configSchema: [],
    defaultConfig: {},
    generateCode: (_node, inputs, outputVar) =>
      `${outputVar} = classification_report(${inputs['y_true'] || 'y_true'}, ${inputs['y_pred'] || 'y_pred'})\nprint(${outputVar})`,
    imports: ['from sklearn.metrics import classification_report'], pipPackages: ['scikit-learn'],
  },

  confusion_matrix: {
    type: 'confusion_matrix', label: 'Confusion Matrix', category: 'eval',
    description: 'Plot a confusion matrix heatmap',
    icon: 'Grid3x3',
    inputs: [
      { id: 'y_true', label: 'y_true', type: 'dataframe' },
      { id: 'y_pred', label: 'y_pred', type: 'dataframe' },
    ],
    outputs: [{ id: 'figure', label: 'figure', type: 'image' }],
    configSchema: [],
    defaultConfig: {},
    generateCode: (_node, inputs, outputVar) => [
      `from sklearn.metrics import confusion_matrix as _cm_fn`,
      `import plotly.figure_factory as ff`,
      `_cm = _cm_fn(${inputs['y_true'] || 'y_true'}, ${inputs['y_pred'] || 'y_pred'})`,
      `${outputVar} = ff.create_annotated_heatmap(_cm.tolist(), colorscale='Blues')`,
      `${outputVar}.update_layout(title='Confusion Matrix')`,
      `${outputVar}.show()`,
    ].join('\n'),
    imports: ['from sklearn.metrics import confusion_matrix'], pipPackages: ['scikit-learn', 'plotly'],
  },

  roc_auc: {
    type: 'roc_auc', label: 'ROC / AUC Curve', category: 'eval',
    description: 'Plot ROC curve and compute AUC',
    icon: 'TrendingUp',
    inputs: [
      { id: 'y_true', label: 'y_true', type: 'dataframe' },
      { id: 'y_score', label: 'y_score', type: 'dataframe' },
    ],
    outputs: [{ id: 'figure', label: 'figure', type: 'image' }],
    configSchema: [],
    defaultConfig: {},
    generateCode: (_node, inputs, outputVar) => [
      `from sklearn.metrics import roc_curve, auc as _auc_fn`,
      `import plotly.graph_objects as go`,
      `_fpr, _tpr, _ = roc_curve(${inputs['y_true'] || 'y_true'}, ${inputs['y_score'] || 'y_score'})`,
      `_roc_auc = _auc_fn(_fpr, _tpr)`,
      `${outputVar} = go.Figure()`,
      `${outputVar}.add_trace(go.Scatter(x=list(_fpr), y=list(_tpr), name=f"AUC={_roc_auc:.2f}"))`,
      `${outputVar}.update_layout(title="ROC Curve", xaxis_title="FPR", yaxis_title="TPR")`,
      `${outputVar}.show()`,
    ].join('\n'),
    imports: ['from sklearn.metrics import roc_curve, auc'], pipPackages: ['scikit-learn', 'plotly'],
  },

  regression_metrics: {
    type: 'regression_metrics', label: 'Regression Metrics', category: 'eval',
    description: 'MAE, RMSE, R² metrics',
    icon: 'Gauge',
    inputs: [
      { id: 'y_true', label: 'y_true', type: 'dataframe' },
      { id: 'y_pred', label: 'y_pred', type: 'dataframe' },
    ],
    outputs: [{ id: 'metrics', label: 'metrics (dict)', type: 'dict' }],
    configSchema: [],
    defaultConfig: {},
    generateCode: (_node, inputs, outputVar) =>
      `${outputVar} = {"mae": mean_absolute_error(${inputs['y_true'] || 'y_true'}, ${inputs['y_pred'] || 'y_pred'}), "rmse": mean_squared_error(${inputs['y_true'] || 'y_true'}, ${inputs['y_pred'] || 'y_pred'}, squared=False), "r2": r2_score(${inputs['y_true'] || 'y_true'}, ${inputs['y_pred'] || 'y_pred'})}\nprint(${outputVar})`,
    imports: ['from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score'], pipPackages: ['scikit-learn'],
  },

  plotly_chart: {
    type: 'plotly_chart', label: 'Plotly Chart', category: 'eval',
    description: 'Create an interactive Plotly visualization',
    icon: 'BarChart2',
    inputs: [{ id: 'data', label: 'data (DataFrame)', type: 'dataframe' }],
    outputs: [{ id: 'figure', label: 'figure', type: 'image' }],
    configSchema: [
      { key: 'chart_type', label: 'Chart Type', type: 'select', options: ['line', 'bar', 'scatter', 'histogram', 'box'], default: 'line' },
      { key: 'x', label: 'X Column', type: 'string', default: 'x' },
      { key: 'y', label: 'Y Column', type: 'string', default: 'y' },
      { key: 'title', label: 'Title', type: 'string', default: 'My Chart' },
    ],
    defaultConfig: { chart_type: 'line', x: 'x', y: 'y', title: 'My Chart' },
    generateCode: (node, inputs, outputVar) => {
      const { chart_type, x, y, title } = node.data.config;
      const df = inputs['data'] || 'df';
      const fn = chart_type || 'line';
      const extra = fn === 'histogram' ? `x="${x}"` : `x="${x}", y="${y}"`;
      return `import plotly.express as px\n${outputVar} = px.${fn}(${df}, ${extra}, title="${title || 'Chart'}")\n${outputVar}.show()`;
    },
    imports: ['import plotly.express as px'], pipPackages: ['plotly'],
  },

  df_preview: {
    type: 'df_preview', label: 'DataFrame Preview', category: 'eval',
    description: 'Preview the first rows of a DataFrame',
    icon: 'Table',
    inputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    outputs: [{ id: 'preview', label: 'preview', type: 'string' }],
    configSchema: [{ key: 'rows', label: 'Rows to Show', type: 'number', default: 10 }],
    defaultConfig: { rows: 10 },
    generateCode: (node, inputs, outputVar) =>
      `${outputVar} = ${inputs['df'] || 'df'}.head(${node.data.config.rows || 10}).to_string()\nprint(${outputVar})`,
    imports: ['import pandas as pd'], pipPackages: ['pandas'],
  },

  agg_stat: {
    type: 'agg_stat', label: 'Aggregate Stat', category: 'eval',
    description: 'Compute a summary statistic for a column',
    icon: 'Hash',
    inputs: [{ id: 'df', label: 'df', type: 'dataframe' }],
    outputs: [{ id: 'value', label: 'value', type: 'number' }],
    configSchema: [
      { key: 'column', label: 'Column', type: 'string', default: 'value' },
      { key: 'stat', label: 'Statistic', type: 'select', options: ['mean', 'median', 'std', 'min', 'max', 'count'], default: 'mean' },
    ],
    defaultConfig: { column: 'value', stat: 'mean' },
    generateCode: (node, inputs, outputVar) =>
      `${outputVar} = ${inputs['df'] || 'df'}["${node.data.config.column}"].${node.data.config.stat || 'mean'}()\nprint(f"${node.data.config.stat} of ${node.data.config.column}: {${outputVar}}")`,
    imports: ['import pandas as pd'], pipPackages: ['pandas'],
  },
};

// Data links already establish ordering for most nodes. Only operations that
// need to be conditionally triggered expose a flow input; If owns the branch
// outputs rather than every node carrying a redundant flow-through output.
const conditionalInputNodes = new Set([
  'if_condition', 'print_debug', 'file_read', 'file_write',
  'import_lib', 'api_fetch', 'model_trainer', 'training_loop', 'model_save',
  'model_load', 'model_infer', 'llm_call', 'memory_node', 'agent_loop',
  'structured_output', 'classification_report', 'confusion_matrix', 'roc_auc',
  'regression_metrics', 'plotly_chart', 'df_preview', 'agg_stat',
]);
Object.values(nodeRegistry).forEach(def => {
  if (conditionalInputNodes.has(def.type)) {
    def.inputs.unshift({ id: 'flow_in', label: '', type: 'flow', optional: true });
  }
});

export const NODE_CATEGORIES: { id: NodeCategory; label: string; color: string }[] = [
  { id: 'primitive', label: 'Primitives', color: 'hsl(212, 100%, 60%)' },
  { id: 'data',      label: 'Data',       color: 'hsl(142, 71%, 52%)' },
  { id: 'ml',        label: 'Machine Learning', color: 'hsl(258, 90%, 66%)' },
  { id: 'dl',        label: 'Deep Learning',    color: 'hsl(288, 80%, 65%)' },
  { id: 'agent',     label: 'AI Agents',        color: 'hsl(38,  95%, 58%)' },
  { id: 'eval',      label: 'Evaluation',       color: 'hsl(188, 90%, 58%)' },
  { id: 'math',      label: 'Math',             color: 'hsl(18,  90%, 62%)' },
];
