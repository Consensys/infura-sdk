# USAGE - To be removed


## Pseudo flow

Pseudo User flow.
End user should be able to configure and use SDK as clean as possible.
Design patterns to consider: Facade, Delegate, Builder.


## Start


1. Developer imports dependencies 
    > *Usage: npm install dotenv --save*

```sh
import 'dotenv/config'
```

2. Developer imports the Consensys SDK
    > *Usage: npm install csys-sdk --save*

```sh
import ConsensysClient from 'consensys-sdk'
```

3. Developer set up authentication credentials

```sh
const PUBLIC_KEY = process.env.PUBLIC_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY
const API_KEY = process.env.INFURA_API_KEY
```

4. Developer create & configue instance of the Consensys Client 

```sh
const client = new ConsensysClient(API_KEY)
```
5. Developer create and configure instance of the NFT Client to unlock NFT module

const account = client.externallyOwnedAccount(PRIVATE_KEY)
// new ExternallyOwnedAccount(keyPrivate);
account will hold ExternallyOwnedAccount data



```sh
const nftClient = client.nft({
    nftTemplate: 'template1',
    baseUri: '/'
})
```

6. Developer is ready to invoke methods on Consensys NFT module to exec operations like: Mint<single & collection>, Get<single & collection>

```sh
const mintNft = await nftClient.mint('tokenURI');
const getNft = await nftClient.get('tokenURI');
```

7. Response from completed Tx is received and logged 

```sh
console.log('nft:mint', mintNft);
console.log('nft:get', getNft);
```

 
## Next SDK Phase

In next phase to unlock more SDK features users can work on ConsensysClient,
e.g. 

    GasEstimation module:
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


## MVP Features

1. Read
    1.1 Retrieve all NFTs owned by an address
    - getAllNfts(accountNumber) => { nftContractAddress, tokenId }

    1.2 Retrieve metadata attributes
    - getMetaAttr(nftContractAddress, tokenId) => { nftUri, nftMetadata }

    1.3 Retrieve all ERC20 owned by an address
    - getAllErc20(accountNumber) => { erc20ContractAddress, balance }

    1.4 Retrieve ERC20 metadata attributes
    - getErc20MetaAttr(tokenId) => { symbol, name, contractAddress }

2. Write
    2.1 Deploy a collection
    2.2 Mint a collectible
    2.3 Burn a collectible
