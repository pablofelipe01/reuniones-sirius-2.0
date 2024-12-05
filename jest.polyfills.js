// jest.polyfills.js
if (typeof globalThis.Request === 'undefined') {
    globalThis.Request = class Request {
      constructor(url, options = {}) {
        this.url = url;
        this.method = options.method || 'GET';
        this.body = options.body;
        this.headers = new Headers(options.headers);
      }
  
      async json() {
        return JSON.parse(this.body);
      }
    };
  }
  
  if (typeof globalThis.Headers === 'undefined') {
    globalThis.Headers = class Headers {
      constructor(init = {}) {
        this._headers = new Map();
        if (init) {
          Object.entries(init).forEach(([key, value]) => {
            this._headers.set(key.toLowerCase(), value);
          });
        }
      }
    };
  }
  
  if (typeof globalThis.Response === 'undefined') {
    globalThis.Response = class Response {
      constructor(body, init = {}) {
        this._body = body;
        this.status = init.status || 200;
        this.headers = new Headers(init.headers);
      }
  
      async json() {
        return JSON.parse(this._body);
      }
    };
  }