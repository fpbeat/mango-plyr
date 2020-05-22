import {GenericUtil} from '~/lib/utils';

import EventEmitter from 'events';

export default class extends EventEmitter {

    options = {
        endpoint: 'https://jsonbin.org/me/statistics',
        token: 'c280460e-14ce-4a46-b187-1fded1fb08c7'
    };

    initialized = false;

    data = {};
    stored = {};

    constructor(options = {}) {
        super();

        GenericUtil.setOptions(this, options);

        this.fetch();
    }

    fetch() {
      fetch(this.options.endpoint, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'token ' + this.options.token
          }
      }).then(response => {
          if (response.ok) {
              return response.json();
          }

          return Promise.reject(response);
      }).then(data => {
          this.initialized = true;
          this.data = data;

          this.emit('fetched', data);
      }).catch(error => {
         // none
      });
    }

    store(id) {
        if (this.initialized && this.stored[id] === void 0) {
            this.data[id] = (this.data[id] || 0) + 1;

            fetch(this.options.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'token ' + this.options.token
                },
                body: JSON.stringify(this.data)
            }).then(response => {
                if (response.ok) {
                    return response.json();
                }

                return Promise.reject(response);
            }).catch(error => {
                // none
            });
        }

        this.stored[id] = true;
    }
}