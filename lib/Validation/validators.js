export function validateEthereumAddress(address) {
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Exception('Address provided is not a valid address');
    }
}
