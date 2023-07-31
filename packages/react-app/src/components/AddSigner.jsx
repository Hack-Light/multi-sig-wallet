/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { Form, Button } from "antd";
import { ethers } from "ethers";
import { useHistory } from "react-router-dom";
import AddressInput from "./AddressInput";
import proposeTransaction from "../helpers/proposeTransaction";

const AddSigner = ({ members, multiSigAdd, mainnetProvider, apiBaseUrl, neededSigns }) => {
  const [newSigner, setNewSigner] = useState("");
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(false);
  const history = useHistory();

  function checkMemberPresence(address) {
    return members.find(member => {
      // eslint-disable-next-line eqeqeq
      if (member.toLowerCase() == address.toLowerCase()) {
        return true;
      }
      return false;
    });
  }

  async function handlePropose() {
    try {
      setLoading(true);
      await proposeTransaction(
        apiBaseUrl,
        "addSigner(address)",
        [["address"], [newSigner]],
        multiSigAdd,
        0,
        neededSigns,
      );
      setNewSigner("");
      setActive(false);
      setLoading(false);
      history.push("/transactions");
    } catch (err) {
      alert(err);
      console.log(err);
      setActive(false);
      setLoading(false);
    }
  }

  return (
    <div>
      <Form title="Add a Signer" style={{ width: "350px" }}>
        {" "}
        Add New Owner
        <AddressInput
          autoFocus
          ensProvider={mainnetProvider}
          placeholder="New owner address"
          value={newSigner}
          onChange={e => {
            setActive(false);
            console.log(e);
            setNewSigner(e);
            if (checkMemberPresence(e)) setActive(false);
            else if (ethers.utils.isAddress(e)) setActive(true);
          }}
        />
        {newSigner.length > 0 && !ethers.utils.isAddress(newSigner) ? <p>Add a valid address</p> : null}
        {!active && ethers.utils.isAddress(newSigner) ? (
          <p style={{ color: "red" }}>You can't add a signer that's already a member</p>
        ) : null}
        <Button
          title="Propose"
          disabled={!active}
          onClick={() => handlePropose()}
          loading={loading}
          style={{ marginTop: "15px" }}
        >
          Propose
        </Button>
      </Form>
    </div>
  );
};

export default AddSigner;
