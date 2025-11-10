const app = require(".");

const port = process.env.APP_PORT;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
