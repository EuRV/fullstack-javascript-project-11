import onChange from 'on-change';
import * as yup from 'yup';
import initView from './view.js';

const schema = yup.string()
  .url('Ссылка должна быть валидным URL')
  .required('Ссылка должна быть валидным URL');

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    submit: document.querySelector('.btn-primary'),
    feedback: document.querySelector('.feedback'),
  };

  // Model
  const initialState = {
    form: {
      fields: {
        input: '',
      },
      processState: '',
      processError: null,
      errors: {},
    },
    feeds: new Set(),
  };

  // View
  const state = onChange(initialState, initView(elements));

  // Controllers
  elements.input.addEventListener('input', (e) => {
    e.preventDefault();
    state.form.fields.input = e.target.value;
    state.processState = 'filling';
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = state.form.fields.input;
    schema.validate(url.trim())
      .then((data) => {
        if (state.feeds.has(data)) {
          state.form.errors = { message: 'RSS уже существует' };
          return;
        }
        state.form.processState = 'sending';
        state.feeds.add(data);
        state.form.processState = 'success';
      })
      .catch((error) => {
        const { message } = error;
        state.form.errors = { message };
      });
  });
};
