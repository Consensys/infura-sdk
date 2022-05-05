/* eslint-disable */

/*
    Pseudo flow on the User side.
    Whole point is for end users to configure and use SDK as clean as possible.
    This means we need to abstract functionalities in background and expose only required via internal API of the SDK.
    Design patterns to consider: Facade, Delegate, Builder.
*/

/* START */

/*
    1. Developer imports dependencies
    Usage: npm i dotenv --save
*/
import 'dotenv/config'

/*
    2. Developer imports the Consensys SDK
    Usage: npm i csys-sdk --save
*/
import ConsensysClient from 'consensys-sdk'

/*
    3. Developer sets up authentication credentials
*/
const PUBLIC_KEY = process.env.PUBLIC_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY
const INFURA_API_KEY = process.env.INFURA_API_KEY

/*
    4. Developer create & configue instance of the Consensys Client 
*/
const client = new ConsensysClient({
    key: PUBLIC_KEY,
    infuraKey: INFURA_API_KEY,
})

/* 
    5. Developer create and configure instance of the NFT Client to unlock NFT module
*/
const nftClient = client.nft({ // follows 721 and 1155 standard
    nftTemplate: 'template1',
    baseUri: '/'
})


/*
    4. Developer is ready to invoke methods on Consensys NFT module to exec operations like: Mint<single & collection>, Get<single & collection>
*/
const mintNft = await nftClient.mint('tokenURI');
const getNft = await nftClient.get('tokenURI');

/* 
    5. Response from completed Tx is received and logged 
*/
console.log('nft:mint', mintNft);
console.log('nft:get', getNft);

/* 
    NEXT SDK PHASE

    In next phase to unlock more SDK features users can work on ConsensysClient,
    e.g. GasEstimation module:
            ConsensysClient.GasEstimation()
         Token module:
            ConsensysClient.Token()
    
    Idea is that SDK features/modules are exposed via internal SDK API.

    Downside of this approach is that users will need to import full SDK instead of only modules they need.
    Maybe workaround can be to move auth into separate module so that it can be imported as standalone module
    e.g.
        import { AuthClient } from '@consensys-sdk/core'
        import { Nft } from '@consensys-sdk/common'
        import { GasEstimation, Token } from '@consensys-sdk/common'

    this way user imports modules as required while keeping code base reasonably low.
    Downside of this approach is that it takes more time to develop but certainly improves quality and extendibility of the SDK. 

*/


/*
S
MVP READ

- Retrieve all NFTs owned by an address
-- getAllNfts(accountNumber) => { nftContractAddress, tokenId }

- Retrieve metadata attributes
-- getMetaAttr(nftContractAddress, tokenId) => { nftUri, nftMetadata }

- Retrieve all ERC20 owned by an address
-- getAllErc20(accountNumber) => { erc20ContractAddress, balance }

- Retrieve ERC20 metadata attributes
- getErc20MetaAttr(tokenId) => { symbol, name, contractAddress }

MVP WRITE
- Deploy a collection
- Mint a collectible
- Burn a collectible

*/