### installation

1.  first clone repository from git and change directory

```
  git clone https://github.com/FANFAN-WEIMAR/args.me
  cd args.me/
```


2.  install dependencies with for node
```
  npm install
```

3. start database server from folder /home/vofa2169/desktop/interactive-argument-vis
```
  mongod --port 27017 --bind_ip 141.54.159.178 --dbpath=./database
```

4.  run node server
```
  node server.js
```


