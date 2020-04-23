import consola from 'consola'

import { hasKey } from '~/modules/helper'
import { LOG_LEVEL } from '~/constants'

consola.info('Init log ...')

if (process.env.loglevel && hasKey(LOG_LEVEL, process.env.loglevel)) {
  consola.level = LOG_LEVEL[process.env.loglevel]
}
else {
  consola.level = LOG_LEVEL['info']
}

export const log = consola
