import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';

import parserXML from './utils/parser.js';
import initView from './view.js';

const getOriginURL = (url) => {
  const originUrl = new URL('https://allorigins.hexlet.app/get');
  originUrl.searchParams.set('disableCache', 'true');
  originUrl.searchParams.set('url', url);
  return originUrl;
};

const getHttpContents = (url) => {
  const originURL = getOriginURL(url);
  return axios.get(originURL)
    .then((response) => response.data.contents)
    .catch(() => {
      throw new Error('errors.errorNetwork');
    });
};

const updatePosts = (state, timeout = 5000) => {
  const iter = () => {
    state.feeds.forEach(({ id, link }) => {
      const currentLinks = state.posts.filter(({ feedId }) => feedId === id)
        .map((post) => post.link);
      const setPostsLinks = new Set(currentLinks);

      getHttpContents(link)
        .then(parserXML)
        .then(({ posts }) => posts.filter((post) => !setPostsLinks.has(post.link)))
        .then((posts) => {
          const postsIds = posts.map((post) => ({ id: uniqueId(), feedId: id, ...post }));
          state.posts.push(...postsIds);
        })
        .catch((err) => {
          throw new Error(err);
        });
    });

    setTimeout(iter, timeout);
  };
  setTimeout(iter, timeout);
};

export default (elements, state, i18n) => {
  yup.setLocale({
    mixed: {
      notOneOf: 'errors.errorDuble',
    },
    string: {
      url: 'errors.errorValid',
      required: 'errors.not_null',
    },
  });

  const watchedState = onChange(state, initView(elements, state, i18n));

  elements.input.addEventListener('input', (e) => {
    e.preventDefault();
    watchedState.fields = e.target.value;
    watchedState.processState = 'filling';
  });

  elements.divPosts.addEventListener('click', (e) => {
    const eventElement = e.target;
    const postId = eventElement.dataset.id;
    if (eventElement.dataset.bsTarget) {
      const { title, description, link } = watchedState.posts.find(({ id }) => id === postId);
      watchedState.modal = { title, description, link };
    }
    watchedState.readPosts.add(postId);
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const existingUrl = watchedState.feeds.map(({ link }) => link);
    const schema = yup.string().min(1).url().notOneOf(existingUrl);
    const link = watchedState.fields;
    schema.validate(link)
      .then((url) => {
        watchedState.processState = 'sending';
        return getHttpContents(url);
      })
      .then(parserXML)
      .then(({ feed, posts }) => {
        const feedId = uniqueId();
        const postsIds = posts.map((post) => ({ id: uniqueId(), feedId, ...post }));
        watchedState.feeds.push({ id: feedId, link, ...feed });
        watchedState.posts.push(...postsIds);
      })
      .then(() => {
        watchedState.processState = 'success';
      })
      .then(() => updatePosts(watchedState))
      .catch((error) => {
        const message = i18n.t(error.message);
        watchedState.errors = { message };
      })
      .finally(() => {
        watchedState.processState = 'filling';
      });
  });
};
