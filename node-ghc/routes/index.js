

'use strict';

import login from './login'

export default app => {
  app.use('/login', login);
}