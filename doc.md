# **Teach Me UI**

This project uses TypeScript, React and React Redux in Development.

If you're new to any of these, you can click on the links below to get to know about them:

- [TypeScript](https://www.typescriptlang.org) - Typed superset of JavaScript
- [React.js](https://www.reactjs.org) - JavaScript framework
- [React Redux](https://react-redux.js.org/) - State management library

We'll go over each directory in `src` as section (excluding `components`).

## **Table of Contents**

- [actions](#actions)
- [constants](#constants)
- [functions](#functions)
- [reducers](#reducers)
- [styles](#styles)
- [appStore.ts](#appStore.ts)
- [ProtectedRoute.tsx](#ProtectedRoute.tsx)

**Sidebar:** When you look in the, **actions**, **reducers** and **constants** directories, you'll notice that they all have similar file names. This was done to ease identification and relationships for corresponding 'processes'.

So far, the `actions` and `reducers` directories each hold four files and a `__tests__` folder which holds tests for the corresponding files except `index.ts`.

## **actions**

Every function in the `actions` directory is an [action creator](https://redux.js.org/basics/actions#action-creators), nothing more. Although in `auth.ts`, you'll notice some functions do more than just that; they return [thunks](https://daveceddia.com/what-is-a-thunk/) which then create the actions. This is the reason for using `redux-thunk` and `applyMiddleware()` in [`appStore.ts`](#appStore.ts), because Redux action creators are supposed to only create actions (that is, return actions not thunks or anything more).

## **constants**

This directory holds constants used throughout the app which includes (TypeScript) [`interfaces`](https://www.typescriptlang.org/docs/handbook/interfaces.html) too. Basically, interfaces are like or are (custom) types.

## **functions**

In the `functions` directory, `main.ts`, `signin.ts`, `signup.ts` hold handlers [functions that respond to or handle (user) events [gestures]].

Then in `utils.ts` where lie helper/utility functions...

`promisedDispatch()` is a [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)-d variant of Redux's `dispatch()`. It is useful in cases where you want to make sure the store is updated before dispatching an action or you want to perform a task or dispatch an action after the store has been updated. 

It resolves with the current or updated value of state [the store].

`callNetworkStatusChecker()` checks to ensure a user is still connected to the internet after a long period of waiting for a specific network task to complete e.g. signing up or signing in.

It returns void/undefined.

`populateStateWithUserData()` (is an async function that) updates the store with the authenticated user's data.

It returns void/undefined.

`logError()`, as its name implies, logs error thrown from a failed/rejected Promise. It is used as the callback in the `.catch()` method of a Promise.

It returns void/undefined.

## **reducers**

Somewhat similar to `actions`, every function in the `reducers` directory is a [reducer](https://redux.js.org/basics/reducers); that is, they dispatch actions which change state or update the store. That's what they do basically. Nothing more. Nevertheless, the reducers in `validate.ts` help in validation of user inputs before dispatching actions with the result of the validation.

## **styles**

[SASS](https://www.w3schools.com/sass/default.asp) is the CSS preprocessor used in this project for styling.

The `.scss` files named with first letter block are specific to the components for which they are named, while those named in small letters are for (general and) as their names imply.

`index.min.css` is the result of the compilation of all the `.scss` files which are imported in `index.scss`.

## **appStore.ts**

This is a small file which is used to create and initialize the store with the redux-thunk middleWare.

## **ProtectedRoute.tsx**

ProtectedRoute, basically, returns a Route, but a protected Route. It is used to protect the `Main` component/page from users that are not authenticated and also helps in redirecting them to the `Signin` page/component.










