// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract MultiSigWallet {
    using ECDSA for bytes32;
    uint public signaturesRequired = 2;

    enum Role {
        PROPOSER,
        SIGNER,
        NULL
    }

    struct Params {
        bytes callData;
        address to;
        uint256 amount;
        uint8 signRequired;
        uint256 txId;
    }

    address[] owners;
    mapping(address => bool) public isOwner;
    mapping(address => Role) public role;
    mapping(uint256 => bool) public txSent;

    modifier onlySelf() {
        require(msg.sender == address(this), "Not self");
        _;
    }

    constructor() {
        owners.push(0x97843608a00e2bbc75ab0C1911387E002565DEDE);
        owners.push(0x97843608a00e2bbc75ab0C1911387E002565DEDE);
        owners.push(0x97843608a00e2bbc75ab0C1911387E002565DEDE);

        isOwner[0x97843608a00e2bbc75ab0C1911387E002565DEDE] = true;
        isOwner[0x97843608a00e2bbc75ab0C1911387E002565DEDE] = true;
        isOwner[0x97843608a00e2bbc75ab0C1911387E002565DEDE] = true;

        role[0x97843608a00e2bbc75ab0C1911387E002565DEDE] = Role.PROPOSER;
        role[0x97843608a00e2bbc75ab0C1911387E002565DEDE] = Role.PROPOSER;
        role[0x97843608a00e2bbc75ab0C1911387E002565DEDE] = Role.SIGNER;
    }

    // function getTransactionHash() {}

    function execute(
        bytes calldata _calldata,
        address _to,
        uint256 _amount,
        uint256 _txId,
        uint8 _signRequired,
        bytes[] memory signatures
    ) external returns (bytes memory) {
        require(
            isOwner[msg.sender],
            "executeTransaction: only owners can execute"
        );
        require(!txSent[_txId], "Transaction already sent");
        Params memory data;

        data.callData = _calldata;
        data.amount = _amount;
        data.signRequired = _signRequired;
        data.txId = _txId;
        data.to = _to;

        bytes32 _hash = keccak256(abi.encode(data));

        uint8 validSignatures = 0;

        for (uint256 i = 0; i < signatures.length; i++) {
            address recovered = recover(_hash, signatures[i]);

            if (isOwner[recovered]) {
                validSignatures++;
            }
        }

        require(
            validSignatures >= _signRequired,
            "executeTransaction: not enough valid signatures"
        );

        txSent[_txId] = true;

        (bool success, bytes memory result) = _to.call{value: _amount}(
            _calldata
        );
        require(success, "executeTransaction: tx failed");

        return result;
    }

    function recover(
        bytes32 _hash,
        bytes memory _signature
    ) public pure returns (address) {
        return _hash.toEthSignedMessageHash().recover(_signature);
    }

    function addSigner(address _newSigner) public onlySelf {
        require(_newSigner != address(0), "addSigner: zero address");
        require(!isOwner[_newSigner], "addSigner: owner not unique");

        isOwner[_newSigner] = true;
        owners.push(_newSigner);
        role[_newSigner] = Role.SIGNER;
    }

    function removeSigner(address _oldSigner) public onlySelf {
        require(isOwner[_oldSigner], "Signer not fund");

        bool done = false;
        uint8 index;
        for (uint8 i = 0; i < owners.length; i++) {
            if (owners[i] == _oldSigner) {
                index = i;
                done = true;
            }
        }

        require(done, "Signer not found");

        require(owners.length > 1, "Last signer can't be removed !");
        role[owners[index]] = Role.NULL;

        for (uint256 i = index; i < owners.length - 1; i++) {
            owners[i] = owners[i + 1];
        }

        owners.pop();
        isOwner[_oldSigner] = false;

        if (signaturesRequired > owners.length && signaturesRequired > 1) {
            signaturesRequired--;
        }
    }

    function setSignersRequired(uint8 newSignaturesRequired) public onlySelf {
        require(
            newSignaturesRequired > 0,
            "updateSignaturesRequired: must be non-zero sigs required"
        );
        require(
            newSignaturesRequired <= owners.length,
            "Can't have more signers than owners"
        );

        signaturesRequired = newSignaturesRequired;
    }

    function getSigners() public view returns (address[] memory) {
        return owners;
    }

    receive() external payable {}

    fallback() external payable {}
}
