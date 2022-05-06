/*!
 * Copyright(c) CConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */ 

class Client {

    constructor({ accountAddress, key }) {
        this._accountAddress = accountAddress;
        this._key = key;

        this.authenticate();
    }

    async authenticate() {

        const userAccount = await `User authenticated with address ${this._accountAddress} & key ${this._key}.`;
        
        // we will return new Auth module object
        // return new Auth({ accountAddress, key })

        // just for testing
        return console.log(userAccount);

    }

    nft() {


        return null;

    }
}

export {
    Client,
}
