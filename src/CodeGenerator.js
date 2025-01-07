export const generateCode = (data) => {
    let imports = "";
    let code = "";

    switch (data.type) {
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
    probability = ${data.data.probability ? "True" : "False"},
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