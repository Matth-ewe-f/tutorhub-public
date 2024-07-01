"use client";
import React, { FC, useEffect, useState } from "react";
import axios from "axios"

const UserTable : FC = () => {

  const [ data, setData ] = useState([]);

  useEffect(() => {
    axios.get("https://oose-team02-0b139de22250.herokuapp.com/all")
      .then((result) => setData(result.data.data))
  })

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Database ID</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {
            data.map((record : { _id: number; name: string }, index : number) => {
              return (
                <tr key={index}>
                  <td>{ record._id }</td>
                  <td>{ record.name }</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>
  )

}

export default UserTable;