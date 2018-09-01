import React, { Component } from 'react';
import gql from "graphql-tag";
import { Mutation } from "react-apollo";

const ADD_USER = gql`
  mutation AddUser($name: String!) {
    CreateUser(name: $name) {
      name
    }
  }
`;

const AddUser = () => {
    let input;

    return (
        <Mutation mutation={ADD_USER}>
            {(addUser, { data }) => (
                <div>
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            addUser({ variables: { name: input.value } });
                            input.value = "";
                        }}
                    >
                        <input
                            ref={node => {
                                input = node;
                            }}
                        />
                        <button type="submit">Add Todo</button>
                    </form>
                </div>
            )}
        </Mutation>
    );
};

export default AddUser;
