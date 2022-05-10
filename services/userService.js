/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */ 

export default class UserService {

    constructor() {}

    /**
     * Getting user private key stored in .env
     * @returns String | null
     */
    get privateKey() {

        return process.env.PRIVATE_KEY
            ? process.env.PRIVATE_KEY
            : null;
    }

    /**
     * Getting user public key stored in .env
     * @returns String | null
     */
     get publicKey() {

        return process.env.PUBLIC_KEY
            ? process.env.PUBLIC_KEY
            : null;
    }

}