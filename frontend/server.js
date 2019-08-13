const express = require('express');
const proxy = require('http-proxy-middleware');
const morgan = require('morgan');
const R = require('ramda');

const app = express();
const port = 8890;
const backendUrl = process.argv[2]

console.log("Proxying to " + backendUrl)

const buildProxy = pathArr =>
  R.forEach(path =>
    app.use(
      path,
      proxy({
        target: backendUrl,
        changeOrigin: true,
      }),
    ),
  )(pathArr);

app.use(morgan('tiny'));
app.use(express.static('build'));
buildProxy(['/data.js', '/people/**', '/moves', '/missions/**']);
app.use((req, res, next) => {
  res.status(200).sendFile(`${__dirname}/build/index.html`);
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
