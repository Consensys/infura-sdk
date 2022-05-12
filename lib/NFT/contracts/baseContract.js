import { ethers } from 'ethers';
import { BasicNFT } from './basicNFT';

export class BaseContract {
    _address = '';
    _contractObject =  null;

    static factory(template) {
        switch (template) {
            case 'Template1':
                return new BasicNFT();
            default:
                throw new Exception('Invalid template provided');
        }
    }

    abstract deploy() {}

    abstract getFromAddress(address) {}
}
