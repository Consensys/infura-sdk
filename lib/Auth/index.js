/*!
 * Copyright(c) CConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */

export default class Auth {

    constructor({accountAddress, key}) {
        this._accountAddress = accountAddress
        this._key = key
    }

    async authenticate() {

        const userAccount = await `User authenticated with address ${this._accountAddress} & key ${this._key}.`;
        
        return console.log(userAccount);

    }

}