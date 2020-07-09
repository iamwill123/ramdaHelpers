import React, { useCallback, useContext } from 'react';
import { createCtx } from '../createContext';
import { db } from '../../firebase/firebaseHelpers';
import { initialChannelsState } from '../User/initialState';

import { Channel } from '../../interfaces';
import { Content } from '../../interfaces/Channel';

type AppState = { loading: boolean; currentChannel: Channel | null; channels: Channel[] | null };

type Action =
    | { type: 'LOADING'; payload: any }
    | { type: 'ADD_CHANNEL'; payload: any }
    | { type: 'GET_CHANNEL'; payload: any }
    | { type: 'EDIT_CHANNEL'; payload: any }
    | { type: 'DELETE_CHANNEL'; payload?: any }
    | { type: 'UPDATE_CONTENTS_OF_CHANNEL'; payload?: any }
    | { type: 'GET_ALL_PUBLIC_CHANNELS'; payload: any };

const reducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'LOADING':
            console.log('LOADING CHANNEL');
            return {
                loading: action.payload,
                currentChannel: state.currentChannel,
                channels: state.channels,
            };
        case 'GET_ALL_PUBLIC_CHANNELS':
            console.log('GET_ALL_PUBLIC_CHANNELS');
            return {
                loading: state.loading,
                currentChannel: state.currentChannel,
                channels: action.payload,
            };
        case 'ADD_CHANNEL':
            console.log('ADD_CHANNEL');
            return {
                loading: state.loading,
                currentChannel: action.payload,
                channels: state.channels,
            };
        case 'GET_CHANNEL':
            console.log('GET_CHANNEL', action.payload);
            return {
                loading: state.loading,
                currentChannel: action.payload,
                channels: state.channels,
            };
        case 'EDIT_CHANNEL':
            console.log('EDIT_CHANNEL');
            return {
                loading: state.loading,
                currentChannel: action.payload,
                channels: state.channels,
            };
        case 'UPDATE_CONTENTS_OF_CHANNEL':
            console.log('UPDATE_CONTENTS_OF_CHANNEL');
            return {
                loading: state.loading,
                currentChannel: state.currentChannel,
                channels: state.channels,
            };
        case 'DELETE_CHANNEL':
            console.log('DELETE_CHANNEL');
            return {
                loading: state.loading,
                currentChannel: state.currentChannel,
                channels: state.channels,
            };
        default:
            throw new Error();
    }
};

const [ctx, ChannelProvider] = createCtx(reducer, initialChannelsState);
const ChannelContext = ctx;

const useChannels = () => {
    const context = useContext(ChannelContext);
    if (!context) {
        throw new Error(`useChannels must be used within a ChannelsProvider`);
    }
    const { state, dispatch } = context;
    const channelsRef = db.collection('channels');

    // allow private channels too, premium feat.
    const getAllPublicChannels = useCallback(async () => {
        try {
            dispatch({ type: 'LOADING', payload: true });

            const channels = await channelsRef.where('public', '==', true).limit(12);
            channels.onSnapshot((querySnapshot) => {
                const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
                let allPublicChannels = [] as Channel[];
                querySnapshot.forEach((doc) => {
                    if (doc.exists) {
                        allPublicChannels.push(doc.data() as Channel);
                    } else {
                        return allPublicChannels;
                    }
                });
                // left off here, update context for channels like content
                if (lastVisible) {
                    // console.log('last', lastVisible);
                    const nextContents = channelsRef.where('public', '==', true).startAfter(lastVisible).limit(12);
                    // console.log('getAllPublicChannels nextContents something something', nextContents);
                }

                dispatch({
                    type: 'GET_ALL_PUBLIC_CHANNELS',
                    payload: allPublicChannels,
                });
            });
        } catch (error) {
            console.log('getAllPublicChannels -> getting users error', error);
        } finally {
            dispatch({ type: 'LOADING', payload: false });
        }
    }, [dispatch, channelsRef]);

    const addChannel = useCallback(
        async ({ userId, ...data }) => {
            try {
                dispatch({ type: 'LOADING', payload: true });
                const newChannel = data;
                // console.log('useChannels -> addChannel', newChannel);
                await channelsRef.doc(userId).set(newChannel);
                dispatch({
                    type: 'ADD_CHANNEL',
                    payload: newChannel,
                });
            } catch (error) {
                console.log('addChannel -> saving error', error);
            } finally {
                dispatch({ type: 'LOADING', payload: false });
            }
        },
        [dispatch, channelsRef],
    );

    const getChannel = useCallback(
        async ({ userId, ...data }) => {
            // if channel exists grab channel, if not create it
            try {
                dispatch({ type: 'LOADING', payload: true });
                const doc = await channelsRef.doc(userId).get();
                if (doc.exists) {
                    const chanData: Channel | undefined = doc.data() ? (doc.data() as Channel) : undefined;
                    // console.log('chanData', chanData);
                    dispatch({
                        type: 'GET_CHANNEL',
                        payload: { userId, ...chanData },
                    });
                } else {
                    const newChannel = { userId, ...data };
                    await channelsRef.doc(userId).set(newChannel);
                    dispatch({
                        type: 'ADD_CHANNEL',
                        payload: newChannel,
                    });
                    dispatch({
                        type: 'GET_CHANNEL',
                        payload: newChannel,
                    });
                }
            } catch (error) {
                console.log('getChannel error', error);
            } finally {
                dispatch({ type: 'LOADING', payload: false });
            }
        },
        [dispatch, channelsRef],
    );

    const getChannelById = useCallback(
        async (id) => {
            // if channel exists grab channel, if not create it
            try {
                dispatch({ type: 'LOADING', payload: true });
                await channelsRef
                    .where('id', '==', id)
                    .get()
                    .then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            const channelData = doc.data();
                            // console.log('Channel Content -> getChannelById channelData', channelData);
                            dispatch({
                                type: 'GET_CHANNEL',
                                payload: channelData,
                            });
                        });
                    })
                    .catch((error) => {
                        console.log('Error getting documents: ', error);
                    })
                    .finally(() => {
                        // dispatch({ type: 'LOADING', payload: false });
                    });
            } catch (error) {
                console.log('getChannel error', error);
            } finally {
                dispatch({ type: 'LOADING', payload: false });
            }
        },
        [dispatch, channelsRef],
    );

    const getChannelByKey = useCallback(
        async (key) => {
            // if channel exists grab channel, if not create it
            try {
                dispatch({ type: 'LOADING', payload: true });
                await channelsRef
                    .where('key', '==', key)
                    .get()
                    .then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            const channelData = doc.data();
                            console.log('Channel Content -> getChannelByKey channelData', channelData);
                            dispatch({
                                type: 'GET_CHANNEL',
                                payload: channelData,
                            });
                        });
                    })
                    .catch((error) => {
                        console.log('Error getting documents: ', error);
                    })
                    .finally(() => {
                        // dispatch({ type: 'LOADING', payload: false });
                    });
            } catch (error) {
                console.log('getChannel error', error);
            } finally {
                dispatch({ type: 'LOADING', payload: false });
            }
        },
        [dispatch, channelsRef],
    );

    const editChannel = useCallback(
        async ({ userId, ...data }) => {
            try {
                // dispatch({ type: 'LOADING', payload: true });
                const updatedData = data;
                await channelsRef
                    .doc(userId)
                    .update(updatedData)
                    .then(() => {
                        dispatch({
                            type: 'EDIT_CHANNEL',
                            payload: updatedData,
                        });
                    })
                    .catch((error) => {
                        console.error('Error saving document: ', error);
                    });
            } catch (error) {
                console.log('editChannel -> saving error', error);
            } finally {
                // dispatch({ type: 'LOADING', payload: false });
            }
        },
        [dispatch, channelsRef],
    );

    const updateChannelContentField = useCallback(
        async (userId: string, content: Content[]) => {
            try {
                dispatch({ type: 'LOADING', payload: true });

                await channelsRef
                    .doc(userId)
                    .update({ contents: content })
                    .then(() => {
                        dispatch({
                            type: 'UPDATE_CONTENTS_OF_CHANNEL',
                            // payload: content,
                        });
                    })
                    .catch((error) => {
                        console.error('Error updating document: ', error);
                    });
            } catch (error) {
                console.log('updateChannelContentField -> saving error', error);
            } finally {
                dispatch({ type: 'LOADING', payload: false });
            }
        },
        [dispatch, channelsRef],
    );

    const deleteChannel = useCallback(
        async (id) => {
            dispatch({ type: 'LOADING', payload: true });
            await channelsRef
                .doc(id)
                .delete()
                .then(() => {
                    dispatch({
                        type: 'DELETE_CHANNEL',
                    });
                    console.log('Document successfully deleted!');
                })
                .catch((error) => {
                    console.error('Error removing document: ', error);
                })
                .finally(() => {
                    dispatch({ type: 'LOADING', payload: false });
                });
        },
        [dispatch, channelsRef],
    );

    const doesKeyExistInOtherChannels = useCallback(
        async (key: string, userId: string) => {
            let exists = await channelsRef
                .where('key', '==', key)
                .get()
                .then((querySnapshot) => {
                    let key = { exists: false };
                    querySnapshot.forEach((doc) => {
                        // todo, ref: this is to make sure we are not checking our own key.
                        if (doc.exists && doc.id !== userId) {
                            key.exists = true;
                        } else {
                            key.exists = false;
                        }
                    });
                    return key.exists;
                })
                .catch((error) => {
                    console.log('doesKeyExistInOtherChannels error ', error);
                });
            return exists;
        },
        [dispatch, channelsRef],
    );

    return {
        state,
        addChannel,
        getChannel,
        editChannel,
        deleteChannel,
        getChannelById,
        getChannelByKey,
        getAllPublicChannels,
        updateChannelContentField,
        doesKeyExistInOtherChannels,
    };
};

export { ChannelProvider, useChannels };
