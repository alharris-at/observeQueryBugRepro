import React, { useEffect, useState } from 'react';
import Amplify, { DataStore } from 'aws-amplify';
import { User } from './models'

Amplify.configure({
  aws_appsync_graphqlEndpoint: 'https://fake-appsync-endpoint/graphql',
});

export default function App() {
  const [idToUpdate, setIdToUpdate] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const initializeAppState = async () => {
      // DataStore.clear() doesn't appear to reliably work in this scenario.
      // And want to ensure we have a clean slate for this bug repro.
      // This code just initializes our database with a sample record
      indexedDB.deleteDatabase('amplify-datastore');
      await DataStore.save(new User({ firstName: 'Update', lastName: 'Me' }));
      await DataStore.save(new User({ firstName: 'Ignore', lastName: 'Me' }));
      const queriedIdToUpdate = (await DataStore.query(User, (criteria) => criteria.firstName('eq', 'Update')))[0].id;
      setIdToUpdate(queriedIdToUpdate);

      const subscription = DataStore.observeQuery(User).subscribe((snapshot) => setUsers(snapshot.items));

      return () => subscription && subscription.unsubscribe();
    };

    return initializeAppState();
  }, []);

  const updateUser = async () => {
    const original = await DataStore.query(User, idToUpdate);

    await DataStore.save(
      User.copyOf(original, updated => {
        updated.firstName = "I've been updated";
      })
    );  };

  return (
    <div>
      <button onClick={updateUser}>Update User</button>
      <h5>Users</h5>
      <ul>
        {users.map((user)=> {
          return <li key={user.id}>First Name: "{user.firstName}", Last Name: "{user.lastName}"</li>
        })}
      </ul>
    </div>
  );
}
