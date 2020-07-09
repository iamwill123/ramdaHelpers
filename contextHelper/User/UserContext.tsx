import React, { useCallback, useContext } from 'react';
import { createCtx } from '../createContext';
import { db } from '../../firebase/firebaseHelpers';
import { initialUsersState } from './initialState';

import { User } from '../../interfaces';

type AppState = { loading: boolean; currentUser: User | null; users: User[] | null };

type Action =
    | { type: 'LOADING'; payload: any }
    | { type: 'ADD_USER'; payload: any }
    | { type: 'GET_USER'; payload: any }
    | { type: 'EDIT_USER'; payload: any }
    | { type: 'DELETE_USER'; payload?: any }
    | { type: 'LOG_USER_OUT'; payload?: any }
    | { type: 'GET_ALL_USERS'; payload: any };

// EDIT ALL THESE TO USE SNAPSHOT
const reducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'LOADING':
            console.log('LOADING');
            return {
                loading: action.payload,
                currentUser: state.currentUser,
                users: state.users,
            };
        case 'GET_ALL_USERS':
            console.log('GET_ALL_USERS');
            return {
                loading: state.loading,
                currentUser: state.currentUser,
                users: action.payload,
            };
        case 'ADD_USER':
            console.log('ADD_USER');
            return {
                loading: state.loading,
                currentUser: action.payload,
                users: state.users,
            };
        case 'GET_USER':
            console.log('GET_USER');
            return {
                loading: state.loading,
                currentUser: action.payload,
                users: state.users,
            };
        case 'EDIT_USER':
            console.log('EDIT_USER');
            return {
                loading: state.loading,
                currentUser: action.payload,
                users: state.users,
            };
        case 'DELETE_USER':
            console.log('DELETE_USER');
            return {
                loading: state.loading,
                currentUser: null,
                users: state.users,
            };
        case 'LOG_USER_OUT':
            console.log('LOG_USER_OUT');
            return {
                loading: state.loading,
                currentUser: null,
                users: state.users,
            };
        default:
            throw new Error();
    }
};

const [ctx, UserProvider] = createCtx(reducer, initialUsersState);
const UserContext = ctx;

const useUsers = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error(`useEvents must be used within a EventsProvider`);
    }
    const { state, dispatch } = context;
    const usersRef = db.collection('users');

    const getAllUsers = useCallback(async () => {
        try {
            dispatch({ type: 'LOADING', payload: true });
            usersRef.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    if (doc.exists) {
                        const allUsers = doc.data();
                        // console.log('getAllUsers -> allUsers', allUsers);
                        dispatch({
                            type: 'GET_ALL_USERS',
                            payload: allUsers,
                        });
                    } else {
                        dispatch({
                            type: 'GET_ALL_USERS',
                            payload: [],
                        });
                    }
                });
            });
        } catch (error) {
            console.log('getAllUsers -> getting users error', error);
        } finally {
            dispatch({ type: 'LOADING', payload: false });
        }
    }, [dispatch, usersRef]);

    const addUser = useCallback(
        async ({ id, name, email, photoURL }) => {
            try {
                dispatch({ type: 'LOADING', payload: true });
                const newUser = { id, name, email, photoURL };
                await usersRef.doc(id).set(newUser);
                dispatch({
                    type: 'ADD_USER',
                    payload: {
                        id,
                        name,
                        email,
                        photoURL,
                    },
                });
            } catch (error) {
                console.log('useUsers -> saving error', error);
            } finally {
                dispatch({ type: 'LOADING', payload: false });
            }
        },
        [dispatch, usersRef],
    );

    const getUser = useCallback(
        async ({ id, name, email, photoURL }) => {
            // if user exists grab user, if not create it
            try {
                dispatch({ type: 'LOADING', payload: true });
                const doc = await usersRef.doc(id).get();
                if (doc.exists) {
                    const data = doc.data();
                    dispatch({
                        type: 'GET_USER',
                        payload: data,
                    });
                } else {
                    const newUser = { id, name, email, photoURL };
                    await usersRef.doc(id).set(newUser);
                    dispatch({
                        type: 'ADD_USER',
                        payload: {
                            id,
                            name,
                            email,
                            photoURL,
                        },
                    });
                    dispatch({
                        type: 'GET_USER',
                        payload: newUser,
                    });
                }
            } catch (error) {
                console.log('error', error);
            } finally {
                dispatch({ type: 'LOADING', payload: false });
            }
        },
        [dispatch, usersRef],
    );

    const editUser = useCallback(
        ({ id, name, email, photoURL }) => {
            dispatch({
                type: 'EDIT_USER',
                payload: {
                    id,
                    name,
                    email,
                    photoURL,
                },
            });
        },
        [dispatch],
    );

    const deleteUser = useCallback(() => {
        dispatch({ type: 'LOADING', payload: true });
        dispatch({
            type: 'DELETE_USER',
        });
        // todo: delete from server - firebase
        dispatch({ type: 'LOADING', payload: false });
    }, [dispatch]);

    const logUserOut = useCallback(() => {
        dispatch({ type: 'LOADING', payload: true });
        dispatch({
            type: 'LOG_USER_OUT',
        });
        dispatch({ type: 'LOADING', payload: false });
    }, [dispatch]);

    return { state, getAllUsers, addUser, getUser, editUser, deleteUser, logUserOut };
};

export { UserProvider, useUsers };
