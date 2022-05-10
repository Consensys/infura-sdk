/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */ 

import { Client } from './lib/consensysClient.js';


const consensysClient = new Client();

consensysClient.authenticate({
    accountAddress: '123', 
    key: '321'
});

consensysClient.nft.mint();


export default consensysClient;
