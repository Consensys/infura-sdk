import Auth from '../Auth';
import { HttpService } from '../../services/httpService';
import NFT_API_URL from './constants';

export default class SDK {
  /* Private property */
  #auth = null;

  #apiPath = null;

  #httpClient = null;

  constructor(auth) {
    if (!(auth instanceof Auth)) {
      throw new Error('[SDK.constructor] You need to pass a valid instance of Auth class!');
    }
    this.#auth = auth;

    this.#apiPath = `/api/v1/networks/${this.#auth.getChainId()}/`;
    this.#httpClient = new HttpService(NFT_API_URL, this.#auth.getApiAuth());
  }
}
