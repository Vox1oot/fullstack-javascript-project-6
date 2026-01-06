export const SessionConfig = {
  secret: process.env.SESSION_SECRET,
  cookie: {
    path: '/',
  },
}
