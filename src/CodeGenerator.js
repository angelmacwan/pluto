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
            code = `
def get_model():
    m = KNeighborsClassifier(n_neighbors = ${data.data.n_neighbors},
    algorithm = '${data.data.algorithm}',
    leaf_size = ${data.data.leaf_size},
    metric = '${data.data.metric}')

    return m

model = get_model()`
            break;

        case 'DecisionTree':
            imports = "from sklearn.tree import DecisionTreeClassifier"
            code = `
def get_model():
    m = DecisionTreeClassifier(criterion = '${data.data.criterion}',
            splitter = '${data.data.splitter}',
            max_depth = ${data.data.max_depth},
            min_samples_split = ${data.data.min_samples_split},
            min_samples_leaf = ${data.data.min_samples_leaf},
            random_state = RANDOM_SEED)

    return m

model = get_model()
`
            break;

        case 'ClassificationReport':
            imports = "from sklearn.metrics import classification_report"
            code = `print(classification_report(y_test, y_pred))`
            break;

        case 'TrainModel':
            imports = ""
            code = `model.fit(X_train, y_train)
y_pred = model.predict(X_test)`
            break;

        case 'RandomForest':
            imports = "from sklearn.ensemble import RandomForestClassifier"
            code = `
def get_model():
    m = RandomForestClassifier(n_estimators = ${data.data.n_estimators},
    criterion = '${data.data.criterion}',
    max_depth = ${data.data.max_depth},
    min_samples_split = ${data.data.min_samples_split},
    min_samples_leaf = ${data.data.min_samples_leaf},
    bootstrap = ${data.data.bootstrap},
    random_state = RANDOM_SEED)

    return m

model = get_model()`;
            break;


        case 'KfoldCV':
            if (data.data.stratify) {
                imports = "from sklearn.model_selection import StratifiedKFold"

                code = `kf = StratifiedKFold(n_splits = ${data.data.k},
        shuffle = ${data.data.shuffle ? "True" : "False"},
        random_state = RANDOM_SEED)`

            } else {
                imports = "from sklearn.model_selection import KFold"
                code = `kf = KFold(n_splits = ${data.data.k},
        shuffle = ${data.data.shuffle ? "True" : "False"},
        random_state = RANDOM_SEED)`
            }

            imports += "\nimport numpy as np"
            imports += "\nfrom sklearn.metrics import accuracy_score"
            imports += "\nfrom sklearn.metrics import classification_report"

            code += "\n"
            code += `
X = np.array(X)
y = np.array(y)
fold_accuracies = []

for fold, (train_index, test_index) in enumerate(kf.split(X,y)):
    print(f"Fold {fold}")
    X_train, X_test = X[train_index], X[test_index]
    y_train, y_test = y[train_index], y[test_index]
    model = get_model()
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    fold_accuracies.append(accuracy)
    print(classification_report(y_test, y_pred))

print(f"Mean Accuracy: {np.mean(fold_accuracies):.4f}")
print(f"Standard Deviation: {np.std(fold_accuracies):.4f}")`

            break;

        case 'SVC':
            imports = "from sklearn.svm import SVC"
            code = `
def get_model():
    m = SVC(C = ${data.data.C},
    kernel = '${data.data.kernel}',
    degree = ${data.data.degree},
    gamma = '${data.data.gamma}',
    coef0 = ${data.data.coef0},
    probability = ${data.data.probability},
    tol = ${data.data.tol},
    max_iter = ${data.data.max_iter})

    return m

model = get_model()`
            break;

        case 'LinearSVC':
            imports = "from sklearn.svm import LinearSVC"
            code = `
def get_model():
    m = LinearSVC(C = ${data.data.C},
    max_iter = ${data.data.max_iter},
    tol = ${data.data.tol},
    dual = ${data.data.dual},
    loss = '${data.data.loss}',
    penalty = '${data.data.penalty}')

    return m

model = get_model()`
            break;

        default:
            imports = ""
            code = "UNIDENTIFIED NODE \n" + data.type;
            code += JSON.stringify(data.data, null, 2);
            break;
    }

    return { imports, code };
}