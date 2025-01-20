import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

// Define initial state for KNN Imputer node
const getInitialState = () => ({
    k: 5,
    shuffle: true,
    stratify: false,
    imports: `from sklearn.model_selection import StratifiedKFold, KFold
import numpy as np
from sklearn.metrics import accuracy_score, classification_report`,

    code: `
def get_kfold_model():
    return model

kf = KFold(n_splits = 5, shuffle = True, random_state = RANDOM_SEED)

X = np.array(X)
y = np.array(y)
fold_accuracies = []

for fold, (train_index, test_index) in enumerate(kf.split(X,y)):
    print(f"Fold {fold}")
    X_train, X_test = X[train_index], X[test_index]
    y_train, y_test = y[train_index], y[test_index]
    kfmodel = get_kfold_model()
    kfmodel.fit(X_train, y_train)
    y_pred = kfmodel.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    fold_accuracies.append(accuracy)
    print(classification_report(y_test, y_pred))

print(f"Mean Accuracy: {np.mean(fold_accuracies):.4f}")
print(f"Standard Deviation: {np.std(fold_accuracies):.4f}")`,
});

export default memo(({ data }) => {
    // Initialize state when component mounts if it's empty
    useEffect(() => {
        if (data.updateNodeState && Object.keys(data).length <= 1) {
            data.updateNodeState(getInitialState());
        }
    }, [data]);

    // Destructure values from data, falling back to initial state values
    const {
        k = 5,
        shuffle = true,
        stratify = false,
        imports = `from sklearn.model_selection import StratifiedKFold, KFold
import numpy as np
from sklearn.metrics import accuracy_score, classification_report`,

        code = `
def get_kfold_model():
    return model

kf = KFold(n_splits = 5, shuffle = True, random_state = RANDOM_SEED)

X = np.array(X)
y = np.array(y)
fold_accuracies = []

for fold, (train_index, test_index) in enumerate(kf.split(X,y)):
    print(f"Fold {fold}")
    X_train, X_test = X[train_index], X[test_index]
    y_train, y_test = y[train_index], y[test_index]
    kfmodel = get_kfold_model()
    kfmodel.fit(X_train, y_train)
    y_pred = kfmodel.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    fold_accuracies.append(accuracy)
    print(classification_report(y_test, y_pred))

print(f"Mean Accuracy: {np.mean(fold_accuracies):.4f}")
print(f"Standard Deviation: {np.std(fold_accuracies):.4f}")`,
        updateNodeState = () => { }
    } = data;

    const updateState = (updates) => {
        const newState = {
            ...data,
            ...updates
        }
        newState.code = ""

        if (newState.stratify) {
            newState.code = `kf = StratifiedKFold(n_splits = ${newState.k},
                shuffle = ${newState.shuffle ? "True" : "False"},
                random_state = RANDOM_SEED)`

        } else {
            newState.code = `kf = KFold(n_splits = ${newState.k},
                shuffle = ${newState.shuffle ? "True" : "False"},
                random_state = RANDOM_SEED)`
        }
        newState.code += `
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

        updateNodeState(newState);
    };

    return (
        <div className='customNode node-type-cv'>
            <Handle
                type="target"
                position={Position.Left}
            />

            <div className='node-header'>Kfold CV</div>

            <div className='node-body'>
                <div className="input-group">
                    <label>
                        K:
                        <input
                            type="number"
                            value={k}
                            onChange={(e) => updateState({ k: parseInt(e.target.value) || 1 })}
                            min="1"
                            style={{ width: '80px' }}
                        />
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Shuffle:
                        <input
                            type="checkbox"
                            checked={shuffle}
                            onChange={(e) => updateState({ shuffle: e.target.checked })}
                        />
                    </label>
                </div>

                <div className="input-group">
                    <label>
                        Stratify:
                        <input
                            type="checkbox"
                            checked={stratify}
                            onChange={(e) => updateState({ stratify: e.target.checked })}
                        />
                    </label>
                </div>

            </div>

            <Handle
                type="source"
                position={Position.Right}
            />
        </div>
    );
});

export { getInitialState };