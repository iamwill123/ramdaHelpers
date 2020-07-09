import React, { useCallback, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createCtx } from '../createContext';
import { db } from '../../firebase/firebaseHelpers';
import { initialContentsState } from '../User/initialState';
import { Content } from '../../interfaces';
import { isReallyNotEmpty, removeDupsById, sortByDateDesc } from '../../components/Channel/Helpers/ramdaHelpers';

type AppState = {
    loading: boolean;
    currentContent: Content | null;
    lastVisiblePublicContent: any | null;
    lastVisibleChannelContent: any | null;
    allPublicContent: Content[] | any[] | null | undefined;
    contentsOfChannel: Content[] | any[];
    // contentsOfChannel: Content[] | any[] | null | undefined;
};

type Action =
    | { type: 'LOADING'; payload: any }
    | { type: 'ADD_CONTENT'; payload: any }
    | { type: 'GET_CONTENT'; payload: any }
    | { type: 'EDIT_CONTENT'; payload?: any }
    | { type: 'DELETE_CONTENT'; payload?: any }
    | { type: 'GET_MORE_PUBLIC_CONTENT'; payload: any[] | any }
    | { type: 'GET_MORE_CHANNEL_CONTENT'; payload: any[] | any }
    | { type: 'GET_ALL_CONTENT_OF_CHANNEL'; payload: any }
    | { type: 'GET_ALL_PUBLIC_CONTENT'; payload: any[] | any }
    | { type: 'SET_LAST_VISIBLE_PUBLIC_CONTENT'; payload: any }
    | { type: 'SET_LAST_VISIBLE_CHANNEL_CONTENT'; payload: any };

const reducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'LOADING':
            console.log('LOADING CONTENT');
            return {
                loading: action.payload,
                currentContent: state.currentContent,
                allPublicContent: state.allPublicContent,
                contentsOfChannel: state.contentsOfChannel,
                lastVisiblePublicContent: state.lastVisiblePublicContent,
                lastVisibleChannelContent: state.lastVisibleChannelContent,
            };
        case 'GET_ALL_PUBLIC_CONTENT':
            console.log('GET_ALL_PUBLIC_CONTENT');
            return {
                loading: state.loading,
                currentContent: state.currentContent,
                allPublicContent: action.payload,
                contentsOfChannel: state.contentsOfChannel,
                lastVisiblePublicContent: state.lastVisiblePublicContent,
                lastVisibleChannelContent: state.lastVisibleChannelContent,
            };
        case 'GET_ALL_CONTENT_OF_CHANNEL':
            console.log('GET_ALL_CONTENT_OF_CHANNEL');
            return {
                loading: state.loading,
                currentContent: state.currentContent,
                allPublicContent: state.allPublicContent,
                contentsOfChannel: action.payload,
                lastVisiblePublicContent: state.lastVisiblePublicContent,
                lastVisibleChannelContent: state.lastVisibleChannelContent,
            };
        case 'GET_MORE_PUBLIC_CONTENT':
            console.log('GET_MORE_PUBLIC_CONTENT');
            return {
                loading: state.loading,
                currentContent: state.currentContent,
                allPublicContent: sortByDateDesc(removeDupsById([...state.allPublicContent, ...action.payload])),
                contentsOfChannel: state.contentsOfChannel,
                lastVisiblePublicContent: state.lastVisiblePublicContent,
                lastVisibleChannelContent: state.lastVisibleChannelContent,
            };
        case 'GET_MORE_CHANNEL_CONTENT':
            console.log('GET_MORE_CHANNEL_CONTENT');
            return {
                loading: state.loading,
                currentContent: state.currentContent,
                allPublicContent: state.allPublicContent,
                contentsOfChannel: sortByDateDesc(removeDupsById([...state.contentsOfChannel, ...action.payload])),
                lastVisiblePublicContent: state.lastVisiblePublicContent,
                lastVisibleChannelContent: state.lastVisibleChannelContent,
                // contentsOfChannel: removeDupsById([...state.contentsOfChannel, ...action.payload]),
            };
        case 'SET_LAST_VISIBLE_PUBLIC_CONTENT':
            console.log('SET_LAST_VISIBLE_PUBLIC_CONTENT');
            return {
                loading: state.loading,
                currentContent: state.currentContent,
                allPublicContent: state.allPublicContent,
                contentsOfChannel: state.contentsOfChannel,
                lastVisiblePublicContent: action.payload,
                lastVisibleChannelContent: state.lastVisibleChannelContent,
            };
        case 'SET_LAST_VISIBLE_CHANNEL_CONTENT':
            console.log('SET_LAST_VISIBLE_CHANNEL_CONTENT');
            return {
                loading: state.loading,
                currentContent: state.currentContent,
                allPublicContent: state.allPublicContent,
                contentsOfChannel: state.contentsOfChannel,
                lastVisiblePublicContent: state.lastVisiblePublicContent,
                lastVisibleChannelContent: action.payload,
            };
        case 'ADD_CONTENT':
            console.log('ADD_CONTENT');
            return {
                loading: state.loading,
                currentContent: action.payload,
                allPublicContent: state.allPublicContent,
                contentsOfChannel: state.contentsOfChannel,
                lastVisiblePublicContent: state.lastVisiblePublicContent,
                lastVisibleChannelContent: state.lastVisibleChannelContent,
            };
        case 'GET_CONTENT':
            console.log('GET_CONTENT', action.payload);
            return {
                loading: state.loading,
                currentContent: action.payload,
                allPublicContent: state.allPublicContent,
                contentsOfChannel: state.contentsOfChannel,
                lastVisiblePublicContent: state.lastVisiblePublicContent,
                lastVisibleChannelContent: state.lastVisibleChannelContent,
            };
        case 'EDIT_CONTENT':
            console.log('EDIT_CONTENT');
            return {
                loading: state.loading,
                currentContent: state.currentContent,
                allPublicContent: state.allPublicContent,
                contentsOfChannel: state.contentsOfChannel,
                lastVisiblePublicContent: state.lastVisiblePublicContent,
                lastVisibleChannelContent: state.lastVisibleChannelContent,
            };
        case 'DELETE_CONTENT':
            console.log('DELETE_CONTENT');
            return {
                loading: state.loading,
                currentContent: state.currentContent,
                allPublicContent: state.allPublicContent,
                contentsOfChannel: state.contentsOfChannel,
                lastVisiblePublicContent: state.lastVisiblePublicContent,
                lastVisibleChannelContent: state.lastVisibleChannelContent,
            };
        default:
            throw new Error();
    }
};

const [ctx, ContentProvider] = createCtx(reducer, initialContentsState);
const ContentContext = ctx;

// const append = (item: any, list: any) => [...list, item];

const useContent = () => {
    const context = useContext(ContentContext);
    if (!context) {
        throw new Error(`useContent must be used within a ContentsProvider`);
    }
    const { state, dispatch } = context;
    const contentsRef = db.collection('contents');

    const setLastVisible = useCallback(
        (querySnapshot: any, path: string) => {
            const type = path === 'public' ? 'SET_LAST_VISIBLE_PUBLIC_CONTENT' : 'SET_LAST_VISIBLE_CHANNEL_CONTENT';
            const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
            if (isReallyNotEmpty(lastVisible)) {
                dispatch({
                    type: type,
                    payload: lastVisible,
                });
            }
        },
        [dispatch],
    );

    // add contents of the DB
    const getAllPublicContent = useCallback(async () => {
        // get all users contents where draft === false
        try {
            dispatch({ type: 'LOADING', payload: true });
            const contents = contentsRef
                .where('public', '==', true)
                .where('draft', '==', false)
                .orderBy('createdAt', 'desc')
                .limit(9);

            contents.onSnapshot((querySnapshot) => {
                // Last Visible Document (Document ID To Start From For Proceeding Queries)
                setLastVisible(querySnapshot, 'public');

                let allPublicContent = [] as Content[];
                querySnapshot.forEach((doc) => {
                    if (doc.exists) {
                        allPublicContent.push(doc.data() as Content);
                    } else {
                        return allPublicContent;
                    }
                });

                dispatch({
                    type: 'GET_ALL_PUBLIC_CONTENT',
                    payload: allPublicContent,
                });
            });
        } catch (error) {
            console.log('getAllUsersContents -> getting users error', error);
        } finally {
            dispatch({ type: 'LOADING', payload: false });
        }
    }, [dispatch, contentsRef]);

    const getMorePublicContent = useCallback(() => {
        // a get more button or infinte scroll trigger.
        const { lastVisiblePublicContent } = state;

        if (isReallyNotEmpty(lastVisiblePublicContent)) {
            // console.log('getMoreContent last', lastVisiblePublicContent?.exists);
            const nextContents = contentsRef
                .where('public', '==', true)
                .where('draft', '==', false)
                .orderBy('createdAt', 'desc')
                .startAfter(lastVisiblePublicContent)
                .limit(9);

            nextContents.onSnapshot((querySnapshot) => {
                setLastVisible(querySnapshot, 'public');

                let content = [] as Content[];
                querySnapshot.forEach((doc) => {
                    if (doc.exists) {
                        content.push(doc.data() as Content);
                    } else {
                        return content;
                    }
                });

                dispatch({
                    type: 'GET_MORE_PUBLIC_CONTENT',
                    payload: content,
                });
            });
        }
    }, [state, dispatch, contentsRef]);

    const addContent = useCallback(
        async ({ id, ...data }) => {
            // console.log('useContent -> data', data);
            try {
                dispatch({ type: 'LOADING', payload: true });
                const newId = uuidv4();
                const newContent: Content = { id: newId, ...data };
                console.log('useContent -> addContent', newContent);
                await contentsRef.doc(newId).set(newContent);
                dispatch({
                    type: 'ADD_CONTENT',
                    payload: newContent,
                });
            } catch (error) {
                console.log('addContent -> saving error', error);
            } finally {
                dispatch({ type: 'LOADING', payload: false });
            }
        },
        [dispatch, contentsRef],
    );

    const getAllContentByChannelId = useCallback(
        async (channelId, path) => {
            // if content exists grab content, if not create it
            try {
                dispatch({ type: 'LOADING', payload: true });
                // Setup listeners using snapshot -> https://firebase.google.com/docs/firestore/query-data/listen
                let contents;
                if (path === 'authChan') {
                    contents = contentsRef.where('channelId', '==', channelId).orderBy('createdAt', 'desc').limit(9);
                }
                if (path === 'pubChan') {
                    contents = contentsRef
                        .where('channelId', '==', channelId)
                        .where('public', '==', true)
                        .where('draft', '==', false)
                        .orderBy('createdAt', 'desc')
                        .limit(9);
                }

                contents?.onSnapshot((querySnapshot) => {
                    // Get the last visible document
                    setLastVisible(querySnapshot, 'channel');

                    let allChannelContent = [] as Content[];
                    querySnapshot.forEach((doc) => {
                        if (doc.exists) {
                            allChannelContent.push(doc.data() as Content);
                        } else {
                            return allChannelContent;
                        }
                    });

                    dispatch({
                        type: 'GET_ALL_CONTENT_OF_CHANNEL',
                        payload: allChannelContent,
                    });
                });
            } catch (error) {
                console.log('getAllContentByChannelId error', error);
            } finally {
                dispatch({ type: 'LOADING', payload: false });
            }
        },
        [dispatch, contentsRef],
    );

    const getMoreChannelContent = useCallback(
        (channelId, path) => {
            // a get more button or infinte scroll trigger.
            const { lastVisibleChannelContent } = state;

            if (isReallyNotEmpty(lastVisibleChannelContent?.exists)) {
                let nextContents;
                if (path === 'authChan') {
                    nextContents = contentsRef
                        .where('channelId', '==', channelId)
                        .orderBy('createdAt', 'desc')
                        .startAfter(lastVisibleChannelContent)
                        .limit(9);
                }
                if (path === 'pubChan') {
                    nextContents = contentsRef
                        .where('channelId', '==', channelId)
                        .where('public', '==', true)
                        .where('draft', '==', false)
                        .orderBy('createdAt', 'desc')
                        .startAfter(lastVisibleChannelContent)
                        .limit(9);
                }
                // console.log('getMoreChannelContent => nextContents', nextContents);

                nextContents?.onSnapshot((querySnapshot) => {
                    setLastVisible(querySnapshot, 'channel');

                    let content = [] as Content[];
                    querySnapshot.forEach((doc) => {
                        if (doc.exists) {
                            content.push(doc.data() as Content);
                        } else {
                            return content;
                        }
                    });

                    dispatch({
                        type: 'GET_MORE_CHANNEL_CONTENT',
                        payload: content,
                    });
                });
            }
        },
        [state, dispatch, contentsRef],
    );

    const getContentById = useCallback(
        async (id) => {
            try {
                dispatch({ type: 'LOADING', payload: true });
                const doc = await contentsRef.doc(id).get();
                if (doc.exists) {
                    const content = doc.data() as Content;
                    dispatch({
                        type: 'GET_CONTENT',
                        payload: content,
                    });
                } else {
                    dispatch({
                        type: 'GET_CONTENT',
                        payload: {},
                    });
                }
            } catch (error) {
                console.log('getContentById error', error);
            } finally {
                dispatch({ type: 'LOADING', payload: false });
            }
        },
        [dispatch, contentsRef],
    );

    const getContentByContentKey = useCallback(
        async (contentKey) => {
            try {
                dispatch({ type: 'LOADING', payload: true });
                const content = contentsRef.where('key', '==', contentKey);

                content.onSnapshot((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        if (doc.exists) {
                            let content = doc.data() as Content;
                            dispatch({
                                type: 'GET_CONTENT',
                                payload: content,
                            });
                        } else {
                            console.log('content does not exist');
                            dispatch({
                                type: 'GET_CONTENT',
                                payload: {},
                            });
                        }
                    });
                });
            } catch (error) {
                console.log('getContentById error', error);
            } finally {
                dispatch({ type: 'LOADING', payload: false });
            }
        },
        [dispatch, contentsRef],
    );

    const editContentById = useCallback(
        async (data) => {
            try {
                dispatch({ type: 'LOADING', payload: true });
                const { id } = data;
                console.log('incomingUpdatedContent', data);
                await contentsRef
                    .doc(id)
                    .update(data)
                    .then(() => {
                        dispatch({
                            type: 'EDIT_CONTENT',
                            // payload: incomingUpdatedContent, // dont need to update we have a listener setup
                        });
                    })
                    .catch((error) => {
                        console.error('Error saving document: ', error);
                    });
            } catch (error) {
                console.log('addContent -> saving error', error);
            } finally {
                dispatch({ type: 'LOADING', payload: false });
            }
        },
        [dispatch, contentsRef],
    );

    const deleteContentById = useCallback(
        async (id) => {
            // dispatch({ type: 'LOADING', payload: true });
            await contentsRef
                .doc(id)
                .delete()
                .then(() => {
                    dispatch({
                        type: 'DELETE_CONTENT',
                    });
                    console.log('Document successfully deleted!');
                })
                .catch((error) => {
                    console.error('Error removing document: ', error);
                    // dispatch({ type: 'LOADING', payload: false });
                });
        },
        [dispatch, contentsRef],
    );

    const doesKeyExistInMyContent = useCallback(
        async (key: string, channelId: string) => {
            let exists = await contentsRef
                .where('key', '==', key)
                .where('channelId', '==', channelId)
                .get()
                .then((querySnapshot) => {
                    let key = { exists: false };
                    querySnapshot.forEach((doc) => {
                        // todo, we only want to check our own channel
                        if (doc.exists) {
                            key.exists = true;
                        } else {
                            key.exists = false;
                        }
                    });
                    return key.exists;
                })
                .catch((error) => {
                    console.log('doesKeyExistInMyContent error ', error);
                });
            return exists;
        },
        [dispatch, contentsRef],
    );

    return {
        state,
        dispatch,
        addContent,
        getContentById,
        editContentById,
        deleteContentById,
        getAllPublicContent,
        getMorePublicContent,
        getMoreChannelContent,
        getContentByContentKey,
        doesKeyExistInMyContent,
        getAllContentByChannelId,
    };
};

export { ContentProvider, useContent };
