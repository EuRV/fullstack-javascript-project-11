import i18next from 'i18next';

import resources from './locales/index.js';
import createDOM from './createDOM.js';
import watcher from './watcher.js';

export default () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  createDOM(i18nInstance);

  const elements = {
    form: document.querySelector('form'),
    feedback: document.querySelector('.feedback'),
    input: document.querySelector('input'),
    divPosts: document.querySelector('.posts'),
    divFeeds: document.querySelector('.feeds'),
    submit: document.querySelector('button[type="submit"]'),
    modal: document.querySelector('#modal'),
  };

  const initialState = {
    fields: '',
    processState: '',
    modal: {
      title: '',
      description: '',
      link: '',
    },
    readPosts: new Set(),
    feeds: [],
    posts: [],
    processError: null,
    errors: {},
  };

  watcher(elements, initialState, i18nInstance);
};
