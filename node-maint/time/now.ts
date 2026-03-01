// arken/packages/node/time/now.ts

import moment from 'moment'

export default () => moment.utc().toDate()
