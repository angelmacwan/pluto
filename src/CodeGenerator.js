export const generateCode = (data) => {
    let imports = "";
    let code = "";

    switch (data.type) {
        case 'RandomSeed':
            imports = ""
            code = `RANDOM_SEED = ${data.data.seed}`
            break;

        case 'DataInput':
            imports = "import pandas as pd"
            code = `target_column = '${data.data.targetColumn}'
df = pd.read_csv("${data.data.fileName}", sep="${data.data.seperator}")`
            break;

        case 'TrainTestSplit':
            imports = "from sklearn.model_selection import train_test_split"
            code = `X = df.drop(columns=[target_column])
y = df[target_column]
X_train, X_test, y_train, y_test = train_test_split(X, y,
                            test_size = ${data.data.splitRatio} ,
                            random_state = RANDOM_SEED,
                            shuffle = ${data.data.shuffle ? "True" : "False"},
                            stratify = ${data.data.stratify ? "y" : "None"} )`

            break;

        case 'DropColumn':
            imports = ""
            if (data.data.columnName) {
                let dropCols = data.data.columnName.split(",");
                dropCols = dropCols.map(col => `"${col.trim()}"`).join(", ");
                code = `X.drop(columns=[${dropCols}], inplace=True)`
            }
            break;

        case 'RemoveNa':
            imports = ""
            code = 'df = df.dropna()'
            break;

        case 'StandardScaler':
            imports = "from sklearn.preprocessing import StandardScaler"
            code = `scaler = StandardScaler(with_mean=${data.data.withMean ? "True" : "False"}, with_std=${data.data.withStd ? "True" : "False"})

X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)`
            break;

        case 'RobustScaler':
            imports = "from sklearn.preprocessing import RobustScaler"
            code = `scaler = RobustScaler(with_centering = ${data.data.withCentering ? "True" : "False"},
            with_scaling = ${data.data.withScaling ? "True" : "False"},
            quantile_range = (${data.data.quantileRange}), unit_variance = ${data.data.unitVariance ? "True" : "False"})

X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)`
            break;

        case 'KNNImputer':
            imports = "from sklearn.impute import KNNImputer"
            code = `imputer = KNNImputer(n_neighbors = ${data.data.n_neighbors},
            weights = '${data.data.weights}',
            metric = '${data.data.metric}')

X_train = imputer.fit_transform(X_train)
X_test = imputer.transform(X_test)`
            break;

        case 'SimpleImputer':
            imports = "from sklearn.impute import SimpleImputer"
            code = `imputer = SimpleImputer(missing_values = ${data.data.missing_values},
            strategy = '${data.data.strategy}')

X_train = imputer.fit_transform(X_train)
X_test = imputer.transform(X_test)`

            break;

        case 'KnnClassifier':
            imports = "from sklearn.neighbors import KNeighborsClassifier"
            code = `model = KNeighborsClassifier(n_neighbors = ${data.data.n_neighbors},
            algorithm = '${data.data.algorithm}',
            leaf_size = ${data.data.leaf_size},
            metric = '${data.data.metric}')

model.fit(X_train, y_train)
y_pred = model.predict(X_test)`
            break;

        case 'DecisionTree':
            imports = "from sklearn.tree import DecisionTreeClassifier"
            code = `model = DecisionTreeClassifier(criterion = '${data.data.criterion}',
            splitter = '${data.data.splitter}',
            max_depth = ${data.data.max_depth},
            min_samples_split = ${data.data.min_samples_split},
            min_samples_leaf = ${data.data.min_samples_leaf},
            random_state = RANDOM_SEED)

model.fit(X_train, y_train)
y_pred = model.predict(X_test)`
            break;

        case 'ClassificationReport':
            imports = "from sklearn.metrics import classification_report"
            code = `print(classification_report(y_test, y_pred))`
            break;


        case 'RandomForest':
            imports = "from sklearn.ensemble import RandomForestClassifier"
            code = `model = RandomForestClassifier(n_estimators = ${data.data.n_estimators},
            criterion = '${data.data.criterion}',
            max_depth = ${data.data.max_depth},
            min_samples_split = ${data.data.min_samples_split},
            min_samples_leaf = ${data.data.min_samples_leaf},
            bootstrap = ${data.data.bootstrap},
            random_state = RANDOM_SEED)

model.fit(X_train, y_train)
y_pred = model.predict(X_test)`
            break;


        case 'CustomCode':
            imports = ""
            code = data.data.code;
            break;

        default:
            imports = ""
            code = "UNIDENTIFIED NODE \n" + data.type;
            code += JSON.stringify(data.data, null, 2);
            break;
    }

    return { imports, code };
}