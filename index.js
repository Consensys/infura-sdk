/*!
 * Copyright(c) CConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */ 

import { Client } from './lib/consensysClient.js';

const consensysClient = new Client({ 
    accountAddress: '123', 
    key: '321' 
});

consensysClient.nft()





export default consensysClient;
