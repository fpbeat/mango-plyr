import Player from './player';
import Tinkoff from './tinkoff';

import '../styles/app.less';

export default {
    version: 'VERSION',

    player: options => new Player(options),
    tinkoff: options => new Tinkoff(options),
};