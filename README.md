Live Site:
PURGED

### TODO

-   🟨 Improve code generation
-   ✅ Make code generation local to each element
-   🟨 Saving and Loading files needs a fix (Problem with loading files)
-   🟨 Add more ML models and Nodes for data processing
-   🟨 Make a dropdown to quickly select new nodes when a handle is dragged
-   🟨 Make the AI generate feature more accessable

## start the react app in dev server

```
npm start
```

## start python backend in dev

```
python ./backend/app.py
```

## build app

```
rm -rf ./backend/static/*
rm -rf ./backend/templates/*
rm -rf ./build

npm run build

cp -r ./build/static/* ./backend/static/
cp -r ./build/index.html ./backend/templates/
```
