import { ethers } from 'ethers';
import { BasicNFT } from './basicNFT';

export class BaseContract {
    _address = '';
    _contractObject = null;

    static factory(template) {
        switch (template) {
            case 'Template1':
                return new BasicNFT();
            default:
                throw new Exception('Invalid template provided');
        }
    }

    abstract deploy() {}

    static getFromAddress(address) {
        let contract;
        switch (template) {
            case 'Template1':
                contract = new BasicNFT();
            default:
                throw new Exception('Invalid template provided');
        }

        contract.getFromAddress(address);
        return contract;
    }
}
