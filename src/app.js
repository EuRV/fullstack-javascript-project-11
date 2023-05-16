import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';

import { renderContent, initView } from './view.js';
import resources from './locales/index.js';
import parserXML from './utils/parser.js';

let count = 0;

const getId = () => {
  count += 1;
  return count;
};

const idCounter = (currentID, posts) => posts
  .map((post) => ({
    id: getId(),
    idFeed: currentID,
    ...post,
  }));

const getAllOriginResponse = (url) => {
  const originUrl = new URL('https://allorigins.hexlet.app/get');
  originUrl.searchParams.set('disableCache', 'true');
  originUrl.searchParams.set('url', url);
  return axios.get(originUrl);
};

const getHttpContents = (url) => getAllOriginResponse(url)
  .then((response) => response.data.contents)
  .catch(() => {
    throw new Error('errors.networkErrors');
  });

const updatePosts = (state, timeout = 5000) => {
  const iter = () => {
    state.feeds.forEach(({ id, link }) => {
      const currentLinks = state.posts.filter(({ idFeed }) => idFeed === id)
        .map((post) => post.link);
      const setPostsLinks = new Set(currentLinks);

      getHttpContents(link)
        .then(parserXML)
        .then(({ posts }) => posts.filter((post) => !setPostsLinks.has(post.link)))
        .then((posts) => {
          const postsID = idCounter(id, posts);
          state.posts.push(...postsID);
        })
        .catch((err) => {
          throw new Error(err);
        });
    });

    setTimeout(iter, timeout);
  };
  setTimeout(iter, timeout);
};

export default () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    submit: document.querySelector('button[aria-label="add"]'),
    feedback: document.querySelector('.feedback'),
    rss: {
      feeds: document.querySelector('.feeds'),
      posts: document.querySelector('.posts'),
    },
    modal: {
      title: document.querySelector('.modal-title'),
      body: document.querySelector('.modal-body'),
      footer: document.querySelector('.full-article'),
    },
    content: {
      body: {
        h_one: document.querySelector('h1[class="display-3 mb-0"]'),
        p_lead: document.querySelector('p[class="lead"]'),
        p_example: document.querySelector('p[class="mt-2 mb-0 text-muted"]'),
        lable_url_input: document.querySelector('label[for="url-input"]'),
        btn_primary: document.querySelector('button[aria-label="add"]'),
      },
      modal: {
        btn_secondary: document.querySelector('button[class="btn btn-secondary"]'),
        a_btn_primary: document.querySelector('a[class="btn btn-primary full-article"]'),
      },
      footer: {
        a: document.querySelector('a[href$="11"]'),
        div: document.querySelector('div[class="text-center"]'),
      },
    },
  };

  const initialState = {
    form: {
      fields: {
        input: '',
      },
      processState: '',
      processError: null,
      errors: {},
    },
    modal: {
      title: '',
      description: '',
      link: '',
    },
    readPosts: new Set(),
    feeds: [],
    posts: [],
  };

  yup.setLocale({
    string: {
      url: () => ({ key: 'errors.invalidURL' }),
    },
    mixed: {
      notOneOf: () => ({ key: 'errors.existingURL' }),
    },
  });

  // View
  renderContent(elements, i18nInstance);
  const state = onChange(initialState, initView(elements, i18nInstance, initialState));

  // Controllers
  elements.input.addEventListener('input', (e) => {
    e.preventDefault();
    state.form.fields.input = e.target.value;
    state.processState = 'filling';
  });

  elements.rss.posts.addEventListener('click', (e) => {
    const eventElement = e.target;
    const postId = parseInt(eventElement.dataset.id, 10);
    if (eventElement.dataset.bsTarget) {
      const { title, description, link } = state.posts.find(({ id }) => id === postId);
      state.modal = { title, description, link };
    }
    state.readPosts.add(postId);
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const existingUrl = state.feeds.map(({ link }) => link);
    const schema = yup.string()
      .url()
      .notOneOf(existingUrl);

    const data = state.form.fields.input;
    schema.validate(data)
      .then((url) => {
        state.form.processState = 'sending';
        return getHttpContents(url);
      })
      .then(parserXML)
      .then(({ feed, posts }) => {
        feed.link = state.form.fields.input;
        feed.id = getId();
        const postsID = idCounter(feed.id, posts);
        return { feed, posts: postsID };
      })
      .then(({ feed, posts }) => {
        state.feeds.push(feed);
        state.posts.push(...posts);
      })
      .then(() => {
        state.form.processState = 'success';
      })
      .then(() => updatePosts(state))
      .catch((error) => {
        let message;
        if (!Array.isArray(error?.errors)) {
          message = i18nInstance.t(error.message);
        } else {
          message = error.errors.map((err) => i18nInstance.t(err.key));
        }
        state.form.errors = { message };
      })
      .finally(() => {
        state.form.processState = 'filling';
      });
  });
};
