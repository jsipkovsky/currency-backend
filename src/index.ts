import app from './app';

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`currency-backend application is running on port ${port}.✅`);
});
