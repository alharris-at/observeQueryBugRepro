# Repro Instructions

Steps to create this repo:

```sh
npx create-react-app bug-repro
cd bug-repro
npm i aws-amplify
cat > src/App.js <<- EOM
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
EOM
# Create `model` directory with a User model that has optional firstName and lastName.
npm start
```

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
