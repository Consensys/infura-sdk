/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

import { config as loadEnv } from 'dotenv';
import { SDK, Auth, TEMPLATES } from './src/index';

loadEnv();

(async () => {
  const acc = new Auth({
    privateKey: process.env.WALLET_PRIVATE_KEY,
    projectId: <string>process.env.INFURA_PROJECT_ID,
    secretId: <string>process.env.INFURA_PROJECT_SECRET,
    rpcUrl: process.env.EVM_RPC_URL,
    chainId: 4,
  });

  // Alternative Auth Instantiation with MetaMask
  // When using SDK in a browser
  //
  // const accWithProvider = new Auth({
  //   projectId: process.env.INFURA_PROJECT_ID,
  //   secretId: process.env.INFURA_PROJECT_SECRET,
  //   rpcUrl: process.env.EVM_RPC_URL,
  //   chainId: 5,
  //   provider: window.ethereum,
  // });
  //

  // E2E type safety on API calls
  const sdk = new SDK(acc);
  // const myNFT: NftDTO = await sdk.getNFTs({
  //   publicAddress: <string>process.env.WALLET_PUBLIC_ADDRESS,
  //   includeMetadata: true,
  // });
  // // auto complete with ctrl + space
  /* eslint-disable no-console */
  // console.log(`NFTs of contract ${myNFT.account} on network ${myNFT.network}:`);
  // array methods (map()) found on assets of type array
  /* eslint-disable array-callback-return */
  // myNFT.assets.map(asset => {
  //   // optional chaining when property can be undefined
  //   /* eslint-disable no-console */
  //   console.log(`Asset #${asset.tokenId} of type ${asset.type} owned by ${asset.metadata?.owner}:`);
  //   if (asset.metadata) {
  //     /* eslint-disable no-console */
  //     console.log(`
  //     - desc: ${asset.metadata.description}
  //     - name: ${asset.metadata.name}
  //     - image: ${asset.metadata.image}
  //     `);
  //   }
  // });

  // Create a new contract
  const newContract = await sdk.deploy({
    template: TEMPLATES.ERC721Mintable,
    params: {
      name: '1507Contract',
      symbol: 'TOC',
      contractURI: 'URI',
    },
  });
  console.log(newContract.contractAddress);

  // READ API
  // Get contract metadata
  // const contractMetadata = await sdk.getContractMetadata({
  //   contractAddress: '0x9daB8FcFe91688d360FeB9ba83F74F29dfC82287',
  // });
  // console.log(contractMetadata);

  // getTokenMetadata
  // const mt = await sdk.getTokenMetadata({
  //   contractAddress: '0x3acc7164bcbda63a8df1f823bf4f0e08efd4ff04',
  //   tokenId: 1,
  // });
  // console.log(mt);

  // Get all NFTs for the specified address
  // const mynfts = await sdk.getNFTs({
  //   publicAddress: <string>process.env.WALLET_PUBLIC_ADDRESS,
  //   includeMetadata: true,
  // });
  // /* eslint-disable no-console */
  // console.log(mynfts.assets[1]);
  // console.log((mynfts.assets[1] as any).metadata.attributes);

  // Get all NFTs for the specified contract
  // const nfts = await sdk.getNFTsForCollection({
  //   contractAddress: '0x9daB8FcFe91688d360FeB9ba83F74F29dfC82287',
  // });
  // console.log(nfts);

  // Get the token metadata
  // const tokenMetadata = await sdk.getTokenMetadata({
  //   contractAddress: '0x9daB8FcFe91688d360FeB9ba83F74F29dfC82287',
  //   tokenId: 0,
  // });
  // console.log(tokenMetadata);

  // Load an existing contract
  // const existingContract = await sdk.loadContract({
  //   template: TEMPLATES.ERC721Mintable,
  //   contractAddress: '0x7Ef864d9fFb6eC7815b22b7A92B8F0EDe97080A8',
  // });

  // console.log('contract address: \n', existingContract.contractAddress);

  // // mint a NFT
  // const mintErr = await newContract.mint({
  //   publicAddress: '0x',
  //   tokenURI: 'https://ipfs.io/ipfs/QmajL9pQBCMhvkwJdVYSBkMXaQnDdsMcEvKYSxmyUc5WYy',
  // });

  // const mintedErr = await mintErr.wait();
  // console.log(mintedErr);

  // // // mint a NFT
  // console.log('first mint:\n');
  // const mint = await newContract.mint({
  //   publicAddress: process.env.WALLET_PUBLIC_ADDRESS as string,
  //   tokenURI: 'https://ipfs.io/ipfs/QmajL9pQBCMhvkwJdVYSBkMXaQnDdsMcEvKYSxmyUc5WYy',
  // });

  // const minted = await mint.wait();
  // console.log(minted);

  // // Transfer a NFT
  // const transfer = await existingContract.transfer({
  //   from: ownerOfToken,
  //   to: anotherAddress,
  //   tokenId: 0,
  // });

  // const transfered = await transfer.wait();
  // console.log(transfered);

  // // ROLES (MINTER and ADMIN)
  // // Grant MINTER Role
  const add = await newContract.accessControl.addMinter({
    publicAddress: <string>process.env.WALLET_PUBLIC_ADDRESS,
  });

  const added = await add.wait();
  console.log(added);

  // // check MINTER role
  const isMinter = await newContract.accessControl.isMinter({
    publicAddress: <string>process.env.WALLET_PUBLIC_ADDRESS,
  });
  console.log(isMinter);

  // // APPROVAL
  // // Set approval for all
  // const setApproval = await existingContract.setApprovalForAll({
  //   to: publicAddress,
  //   approvalStatus: true,
  // });
  // const approvalSet = await setApproval.wait();
  // console.log(approvalSet);

  // // Transfer NFT with approval
  // // 1. owner mints a token
  // console.log('second mint:\n');
  // const tx = await newContract.mint({
  //   publicAddress: process.env.WALLET_PUBLIC_ADDRESS as string,
  //   tokenURI: 'https://ipfs.io/ipfs/QmRfModHffFedTkHSW1ZEn8f19MdPztn9WV3kY1yjaKvBy',
  // });
  // const receipt = await tx.wait();
  // console.log(receipt);

  // // 2. owner approves publicAddress to transfer token that he owns
  // const txApprove = await existingContract.approveTransfer({ to: publicAddress, tokenId: 1 });
  // await txApprove.wait();

  // // new auth as "publicAddress"
  // const accountPublic = new Auth({
  //   privateKey: privateKeyPublicAddress,
  //   projectId: process.env.INFURA_PROJECT_ID,
  //   secretId: process.env.INFURA_PROJECT_SECRET,
  //   rpcUrl: 'http://0.0.0.0:8545',
  //   chainId: 5,
  // });
  // const sdkPublic = new SDK(accountPublic);
  // const existing = await sdkPublic.loadContract({
  //   template: TEMPLATES.ERC721Mintable,
  //   contractAddress: contractObject.contractAddress,
  // });

  // // 3. publicAddress transfers token of owner
  // const txTransfer = await existing.transfer({ from: owner, to: thirdUser, tokenId: 1 });

  // const receipt = await txTransfer.wait();
  // console.log(receipt);

  // // ROYALTIES
  // // Set Royalties for a contract
  // const royalties = await newContract.setRoyalties({
  //   publicAddress: process.env.WALLET_PUBLIC_ADDRESS,
  //   fee: 50,
  // });
  // const royaltiesSet = await royalties.wait();
  // console.log(royaltiesSet);

  // // Get Royalties info for a token at a specific sellPrice
  // const infos = await newContract.royaltyInfo({ tokenId: 1, sellPrice: 100000 });
  // console.log(infos);

  // console.log('check if address isMinter:\n');
  // const isMinter = await newContract.isMinter({
  //   publicAddress: process.env.WALLET_PUBLIC_ADDRESS as string,
  // });
  // console.log(isMinter);
})();
