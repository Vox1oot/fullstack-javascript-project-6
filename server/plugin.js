export default async (app) => {
  app.get('/', async (req, res) => {
    res.send('Hello, World!');
  });
};
