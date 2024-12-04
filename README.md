Live Site:
[pluto-eet.pages.dev](pluto-eet.pages.dev)

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
