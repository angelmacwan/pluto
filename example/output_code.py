import pandas as pd
from sklearn.impute import KNNImputer
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import KFold
import numpy as np
from sklearn.metrics import accuracy_score
from sklearn.metrics import classification_report
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

target_column = 'undefined'
df = pd.read_csv("undefined", sep="undefined")

RANDOM_SEED = 12

imputer = KNNImputer(n_neighbors = 5,
            weights = 'uniform',
            metric = 'nan_euclidean')

X_train = imputer.fit_transform(X_train)
X_test = imputer.transform(X_test)

scaler = StandardScaler(with_mean=True, with_std=True)

X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)


def get_model():
    m = KNeighborsClassifier(n_neighbors = 5,
    algorithm = 'auto',
    leaf_size = 30,
    metric = 'euclidean')

    return m

model = get_model()

model.fit(X_train, y_train)
y_pred = model.predict(X_test)

print(classification_report(y_test, y_pred))

kf = KFold(n_splits = 5,
        shuffle = True,
        random_state = RANDOM_SEED)

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
print(f"Standard Deviation: {np.std(fold_accuracies):.4f}")

print(classification_report(y_test, y_pred))


def get_model():
    m = DecisionTreeClassifier(criterion = 'gini',
            splitter = 'best',
            max_depth = 12,
            min_samples_split = 2,
            min_samples_leaf = 1,
            random_state = RANDOM_SEED)

    return m

model = get_model()


model.fit(X_train, y_train)
y_pred = model.predict(X_test)

print(classification_report(y_test, y_pred))


def get_model():
    m = RandomForestClassifier(n_estimators = 100,
    criterion = 'gini',
    max_depth = 12,
    min_samples_split = 2,
    min_samples_leaf = 1,
    bootstrap = true,
    random_state = RANDOM_SEED)

    return m

model = get_model()

model.fit(X_train, y_train)
y_pred = model.predict(X_test)

print(classification_report(y_test, y_pred))

scaler = StandardScaler(with_mean=True, with_std=True)

X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)


def get_model():
    m = KNeighborsClassifier(n_neighbors = 5,
    algorithm = 'auto',
    leaf_size = 30,
    metric = 'euclidean')

    return m

model = get_model()

model.fit(X_train, y_train)
y_pred = model.predict(X_test)

print(classification_report(y_test, y_pred))

kf = KFold(n_splits = 5,
        shuffle = True,
        random_state = RANDOM_SEED)

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
print(f"Standard Deviation: {np.std(fold_accuracies):.4f}")

print(classification_report(y_test, y_pred))


def get_model():
    m = DecisionTreeClassifier(criterion = 'gini',
            splitter = 'best',
            max_depth = 12,
            min_samples_split = 2,
            min_samples_leaf = 1,
            random_state = RANDOM_SEED)

    return m

model = get_model()


model.fit(X_train, y_train)
y_pred = model.predict(X_test)

print(classification_report(y_test, y_pred))


def get_model():
    m = RandomForestClassifier(n_estimators = 100,
    criterion = 'gini',
    max_depth = 12,
    min_samples_split = 2,
    min_samples_leaf = 1,
    bootstrap = true,
    random_state = RANDOM_SEED)

    return m

model = get_model()

model.fit(X_train, y_train)
y_pred = model.predict(X_test)

print(classification_report(y_test, y_pred))
