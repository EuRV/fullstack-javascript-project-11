import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';

import { renderContent, initView } from './view.js';
import resources from './locales/index.js';
import parserRSS from './utils/parser.js';

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

const getAllOriginUrl = (url) => {
  const originUrl = new URL('https://allorigins.hexlet.app/get');
  originUrl.searchParams.set('disableCache', 'true');
  originUrl.searchParams.set('url', url);
  return originUrl;
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
    rss: {
      feeds: document.querySelector('.feeds'),
      posts: document.querySelector('.posts'),
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
    urls: new Set(),
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
  const state = onChange(initialState, initView(elements, i18nInstance));

  // Controllers
  elements.input.addEventListener('input', (e) => {
    e.preventDefault();
    state.form.fields.input = e.target.value;
    state.processState = 'filling';
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const schema = yup.string()
      .url()
      .notOneOf([...state.urls]);

    const data = state.form.fields.input;
    schema.validate(data)
      .then((url) => {
        state.form.processState = 'sending';
        axios.get(getAllOriginUrl(url))
          .then((response) => {
            const { feed, posts } = parserRSS(response.data.contents);
            feed.id = getId();
            const postsID = idCounter(feed.id, posts);
            return { feed, posts: postsID };
          })
          .then(({ feed, posts }) => {
            state.urls.add(url);
            state.feeds.push(feed);
            state.posts.push(...posts);
          })
          .then(() => {
            state.form.processState = 'success';
          })
          .catch((error) => console.error(error));
      })
      .catch((error) => {
        const message = error.errors.map((err) => i18nInstance.t(err.key));
        state.form.errors = { message };
      });
  });
};
