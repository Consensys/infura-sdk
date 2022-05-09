/*!
 * Copyright(c) CConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */ 

import Auth from './Auth/index.js'
import NFT from './NFT/index.js'

class Client {

    constructor() {}

    authenticate({accountAddress, key}) {
        const user = new Auth({accountAddress, key});
    }
    

    static nft() {
        return new NFT()
        
    }
    
}

export {
    Client,
}
