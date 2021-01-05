import axios from 'axios';
import Pino from 'pino';

import config from '../config';
import { ApiLogin, TntContext } from './interfaces';

export default class TntHandler {
  /** selected identities did */
  did: string;
  /** selected identities uuid */
  identityUuid: string;
  /** result from login */
  authToken: string;
  /** api login with predefined auth headers */
  apiLogin: ApiLogin;
  /** login account id */
  accountUuid: string;
  /** current principal uuid */
  principalUuid: string;
  /** current logger instance */
  logger: Pino;

  /**
   * Creates a new TntHandler and run login + identity loading.
   *
   * @param {string} context  context to login (email + password / api login)
   */
  static async init(context: TntContext) {
    const handler = new TntHandler();
    await handler.init(context);
    return handler;
  }

  constructor() {
    this.logger = Pino({
      prettyPrint: true,
      base: { pid: process.pid }
    });
  }

  /**
   * Load identity for a did / identity uuid within the current principal.
   *
   * @param {string} identity did / uuid
   */
  async getIdentity(identity) {
    return this.request('get', `identity/${identity}`);
  }

  /**
   * Login with specified credentials and load identity parameters.
   *
   * @param {string} context  context to login (email + password / api login)
   */
  async init(context: TntContext) {
    if (context.apiLogin) {
      this.accountUuid = context.apiLogin.accountUuid;
      this.apiLogin = context.apiLogin;
      this.principalUuid = context.apiLogin.principalUuid;

      if (!this.principalUuid || !this.accountUuid || !this.apiLogin['tnt-subscription-key']) {
          throw new Error('please specific the following parameters for token login principalUuid,'
            + ' accountUuid, tnt-subscription-key')
      }
      this.log('info', 'skipped login and use technical auth');
    } else {
      // login the user to access the API
      await this.login(context.emailLogin.email, context.emailLogin.password);
    }

    let identity;
    // if no identity was specified, load the default one for the user
    if (!context.identity) {
      const result = await this.request('get', 'identity/all');
      [identity] = result.hits;
    } else {
      identity = await this.getIdentity(context.identity);
    }

    // save did and identity uuid
    this.did = identity.did;
    this.identityUuid = identity.uuid;
  }

  /**
   * Login to TRUST&TRACE API and save authToken, accountUuid and principalUuid.
   * @param {string} email email to login
   * @param {string} password password to login
   */
  async login(email, password) {
    this.log('info', `Logging in with email ${email}`);

    try {
      const { data } = await axios.post(`${config.tntAuthApi}/login`, { email, password });
      this.authToken = data.token;
      this.accountUuid = data.accountUuid;
      this.principalUuid = data.principalUuid;
    } catch (ex) {
      // will return 404 on missing entity requests
      this.log('error', ex?.response?.data?.error || ex.message);
      throw ex;
    }
  }

  /**
   * Request TRUST&TRACE API
   *
   * @param {string} method api path to access (e.g. identity/all)
   * @param {string} path api path to access (e.g. identity/all)
   * @param {any} payload payload to send
   * @param {boolean} useAuth attach auth headers
   */
  async request(method, path, payload?, baseUrl = config.tntApi) {
    if (!this.authToken && !this.apiLogin) {
      throw new Error('Please login before requesting TRUST&TRACE API');
    }

    const requestOptions = {
      [method === 'get' ? 'params' : 'data']: payload,
      method,
      url: `${baseUrl}/${path}`,
    };

    // ignore authorization token login
    if (this.apiLogin) {
      requestOptions.headers = { ...this.apiLogin };
    } else {
      requestOptions.headers = { authorization: `Bearer ${this.authToken}` };
    }

    try {
      const result = await axios(requestOptions);
      return result.data;
    } catch (ex) {
      // will return 404 on missing entity requests
      if (ex?.response?.status !== 404) {
        this.log('error', ex?.response?.data?.error || ex.message);
        throw ex;
      }
    }

    return null;
  }

  /**
   * Log something.
   *
   * @param {string} type log type
   * @param {string} message log message
   */
  log(type, message) {
    this.logger[type](message);
  }
}

module.exports = TntHandler;
