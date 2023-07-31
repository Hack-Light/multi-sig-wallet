import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Select, Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { Address, AddressInput, Balance, Blockie } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
import { useContractReader, useEventListener, useLocalStorage } from "../hooks";
const axios = require("axios");
const { Option } = Select;

export default function Owners({
  contractName,
  ownerEvents,
  signaturesRequired,
  address,
  nonce,
  userProvider,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
  blockExplorer,
}) {
  const history = useHistory();
  const [uniqueOwnerEvents, setUniqueOwnerEvents] = useState([]);

  const [to, setTo] = useLocalStorage("to");
  const [amount, setAmount] = useLocalStorage("amount", "0");
  const [methodName, setMethodName] = useLocalStorage("addSigner");
  const [newOwner, setNewOwner] = useLocalStorage("newOwner");
  const [newSignaturesRequired, setNewSignaturesRequired] = useLocalStorage("newSignaturesRequired");
  const [data, setData] = useLocalStorage("data", "0x");
  const [selectedRole, setSelectedRole] = useLocalStorage("selectedRole");
  const [signerToChange, setSignerToChange] = useLocalStorage("signerToChange");

  const roleOptions = {
    0: "Executor",
    1: "Signer",
    2: "Null",
  };

  function removeDuplicatesByRole(payload) {
    // Create an object to store unique entries based on the 0 field
    const uniqueEntries = {};

    // Iterate through the data array
    for (const entry of payload) {
      const address = entry[0];
      const role = entry.role;

      // Check if the address already exists in the uniqueEntries object
      if (address in uniqueEntries) {
        // If the current role is lower, replace the existing entry with the current one
        if (role < uniqueEntries[address].role) {
          uniqueEntries[address] = entry;
        }
      } else {
        // If the address doesn't exist in uniqueEntries, add it with the current entry
        uniqueEntries[address] = entry;
      }
    }

    // Convert the uniqueEntries object back to an array and return the result
    const result = Object.values(uniqueEntries);
    return result;
  }

  useEffect(() => {
    const uniqueOwners = removeDuplicatesByRole(ownerEvents);
    setUniqueOwnerEvents(uniqueOwners);
  }, [ownerEvents]);

  return (
    <div>
      <h2 style={{ marginTop: 32 }}>
        Signatures Required: {signaturesRequired ? signaturesRequired.toNumber() : <Spin></Spin>}
      </h2>
      <div style={{ display: "flex" }}>
        <div style={{ display: "flex", margin: "auto", flexDirection: "column" }}>
          <List
            style={{ maxWidth: 400 }}
            bordered
            dataSource={uniqueOwnerEvents}
            renderItem={item => {
              return (
                <List.Item key={"owner_" + item[0]}>
                  <Address
                    address={item[0]}
                    ensProvider={mainnetProvider}
                    blockExplorer={blockExplorer}
                    fontSize={32}
                  />
                  <div style={{ padding: 16 }}>{item[1] ? "👍" : "👎"}</div>
                  <div style={{ padding: 16 }}>{roleOptions[item.role]}</div>
                </List.Item>
              );
            }}
          />

          <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
            <div style={{ margin: 8, padding: 8 }}>
              <Select value={selectedRole} style={{ width: "100%" }} onChange={setSelectedRole}>
                <Option value="1" key="1">
                  Executor
                </Option>
                <Option value="2" key="2">
                  Signer
                </Option>
              </Select>
            </div>

            <div style={{ margin: 8, padding: 8 }}>
              <AddressInput
                autoFocus
                ensProvider={mainnetProvider}
                placeholder="new owner address"
                value={signerToChange}
                onChange={setSignerToChange}
              />
            </div>

            <div style={{ margin: 8, padding: 8 }}>
              <Button
                onClick={() => {
                  console.log("METHOD", signerToChange, setSelectedRole);
                  const calldata = readContracts[contractName].interface.encodeFunctionData("setOwnerRole", [
                    signerToChange,
                    selectedRole,
                  ]);
                  console.log("calldata", calldata);
                  setData(calldata);
                  setAmount("0");
                  setTo(readContracts[contractName].address);
                  setTimeout(() => {
                    history.push("/create");
                  }, 777);
                }}
              >
                Change Role
              </Button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", margin: "auto", flexDirection: "column" }}>
          <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto" }}>
            <div style={{ margin: 8, padding: 8 }}>
              <Select value={methodName} style={{ width: "100%" }} onChange={setMethodName}>
                <Option key="addSigner">addSigner()</Option>
                <Option key="removeSigner">removeSigner()</Option>
              </Select>
            </div>
            <div style={{ margin: 8, padding: 8 }}>
              <AddressInput
                autoFocus
                ensProvider={mainnetProvider}
                placeholder="new owner address"
                value={newOwner}
                onChange={setNewOwner}
              />
            </div>
            {/* <div style={{ margin: 8, padding: 8 }}>
          <Input
            ensProvider={mainnetProvider}
            placeholder="new # of signatures required"
            value={newSignaturesRequired}
            onChange={e => {
              setNewSignaturesRequired(e.target.value);
            }}
          />
        </div> */}
            <div style={{ margin: 8, padding: 8 }}>
              <Button
                onClick={() => {
                  console.log("METHOD", setMethodName);
                  const calldata = readContracts[contractName].interface.encodeFunctionData(methodName, [newOwner]);
                  console.log("calldata", calldata);
                  setData(calldata);
                  setAmount("0");
                  setTo(readContracts[contractName].address);
                  setTimeout(() => {
                    history.push("/create");
                  }, 777);
                }}
              >
                Create Tx
              </Button>
            </div>
          </div>

          <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
            <div style={{ margin: 8, padding: 8 }}>
              <Input
                ensProvider={mainnetProvider}
                placeholder="new # of signatures required"
                value={newSignaturesRequired}
                onChange={e => {
                  setNewSignaturesRequired(e.target.value);
                }}
              />
            </div>
            <div style={{ margin: 8, padding: 8 }}>
              <Button
                onClick={() => {
                  console.log("METHOD", setMethodName);
                  const calldata = readContracts[contractName].interface.encodeFunctionData("setSignersRequired", [
                    newSignaturesRequired,
                  ]);
                  console.log("calldata", calldata);
                  setData(calldata);
                  setAmount("0");
                  setTo(readContracts[contractName].address);
                  setTimeout(() => {
                    history.push("/create");
                  }, 777);
                }}
              >
                Set New Required Signature
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
