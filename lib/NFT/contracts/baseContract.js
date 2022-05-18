import { NFTContractUnlimited } from './nftcontractunlimited.contract';
import { TEMPLATES } from './templates';
import { validateEthereumAddress } from '../../Validation/validators';

export class BaseContract {
    _address = '';
    _contractObject = null;
    _signer = null;

    static factory(template, signer) {
        switch (template) {
            case TEMPLATES.NFTContractCollection:
                return new NFTContractUnlimited(signer);
            default:
                throw new Exception('Invalid template provided');
        }
    }

    static getFromAddress(template, signer, address) {
        validateEthereumAddress(address);
        const contract = this.factory(template, signer);
        contract.getFromAddress(address);
        return contract;
    }

    getAddress() {
        if (!this._address) {
            throw new Exception('Contract address not available. Either deploy a new contract or retrieve from existing address');
        }
        return this._address;
    }
}
