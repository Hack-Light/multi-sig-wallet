// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract MultiSigWallet {
    using ECDSA for bytes32;
    uint public signaturesRequired = 2;

    enum Role {
        EXECUTOR,
        SIGNER,
        NULL
    }

    address[] owners;
    mapping(address => bool) public isOwner;
    mapping(address => Role) public role;
    mapping(uint256 => bool) public txSent;

    uint256 public nonce;
    uint256 public chainId;

    // events
    event Owner(address indexed owner, bool isAdded, Role role);
    event ExecuteTransaction(
        address indexed from,
        address payable to,
        uint256 value,
        bytes data,
        uint256 nonce,
        bytes32 hash,
        bytes result
    );
    event Deposit(address indexed from, uint256 amount, uint256 balance);

    modifier onlySelf() {
        require(msg.sender == address(this), "Not self");
        require(
            role[msg.sender] == Role.SIGNER ||
                role[msg.sender] == Role.EXECUTOR,
            "Unauthorised: You need to be a signer or executor to execute"
        );
        _;
    }

    modifier onlyOwners() {
        require(isOwner[msg.sender], "Not an executor");
        _;
    }

    constructor(
        uint256 _chainId,
        address[] memory _owners,
        uint256 _signaturesRequired
    ) {
        require(
            _signaturesRequired > 0,
            "Number of signature required must be greater than 0"
        );
        signaturesRequired = _signaturesRequired;
        chainId = _chainId;

        for (uint256 i = 0; i < _owners.length; i++) {
            require(
                _owners[i] != address(0),
                "Address Zero can not be a signer"
            );
            require(
                !isOwner[_owners[i]],
                "Duplicate signer: signer alrady exists"
            );
            isOwner[_owners[i]] = true;
            owners.push(_owners[i]);
            role[_owners[i]] = Role.SIGNER;
            emit Owner(_owners[i], isOwner[_owners[i]], role[_owners[i]]);
        }
    }

    function executeTransaction(
        bytes calldata _calldata,
        address _to,
        uint256 _amount,
        bytes[] memory signatures
    ) external onlyOwners returns (bytes memory) {
        require(
            isOwner[msg.sender],
            "executeTransaction: only owners can execute"
        );
        // require(!txSent[_txId], "Transaction already sent");

        // bytes32 _hash = keccak256(abi.encode(data));
        bytes32 _hash = getTransactionHash(nonce, _to, _amount, _calldata);

        nonce++;

        uint8 validSignatures = 0;

        for (uint256 i = 0; i < signatures.length; i++) {
            address recovered = recover(_hash, signatures[i]);
            Role n = role[recovered];
            if (isOwner[recovered]) {
                if (uint256(n) == 1) {
                    validSignatures += uint8(owners.length);
                } else {
                    validSignatures++;
                }
            }
        }

        require(
            validSignatures >= signaturesRequired,
            "executeTransaction: not enough valid signatures"
        );

        (bool success, bytes memory result) = _to.call{value: _amount}(
            _calldata
        );
        require(success, "executeTransaction: tx failed");

        emit ExecuteTransaction(
            msg.sender,
            payable(_to),
            _amount,
            _calldata,
            nonce - 1,
            _hash,
            result
        );

        return result;
    }

    function getTransactionHash(
        uint256 _nonce,
        address to,
        uint256 value,
        bytes memory _calldata
    ) public view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    address(this),
                    chainId,
                    _nonce,
                    to,
                    value,
                    _calldata
                )
            );
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
        emit Owner(_newSigner, isOwner[_newSigner], role[_newSigner]);
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
        emit Owner(_oldSigner, isOwner[_oldSigner], role[_oldSigner]);
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

    // Function to set the role for an owner
    function setOwnerRole(address _owner, uint256 _role) public onlySelf {
        require(isOwner[_owner], "Cannot set role for a non-owner");

        if (_role == 1) {
            role[_owner] = Role.EXECUTOR;
        } else if (_role == 2) {
            role[_owner] = Role.SIGNER;
        } else {
            revert("Invalid role specified");
        }

        emit Owner(_owner, isOwner[_owner], role[_owner]);
    }

    function getSigners() public view returns (address[] memory) {
        return owners;
    }

    function getOwnerRole(address _owner) public view returns (Role) {
        return role[_owner];
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    fallback() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }
}
