"use client";
import React, { FC, useState } from "react";
import axios from "axios";

const CreateUser : FC = () => {

  const [ name, setName ] = useState("");

  const addUser = async (event) => {
    event.preventDefault();
    const url = "https://oose-team02-0b139de22250.herokuapp.com/";
    try {
      await axios.post(url, { name });
    } catch(err) {
      console.error(err);
    }
    setName("");
  };

  return (
    <div className="flex justify-center">
      <input
        className="text-lg border-black border-2"
        value={name}
        onChange={ (event) => setName(event.target.value) }
        placeholder="Enter name"
      />
      <button
        onClick={addUser}
      >
        Add User
      </button>
    </div>
  );

};

export default CreateUser;