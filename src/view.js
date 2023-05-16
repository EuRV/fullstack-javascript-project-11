const renderErrors = (elements, errors) => {
  const errorMessage = errors?.message;
  elements.input.classList.add('is-invalid');
  elements.feedback.classList.add('text-danger');
  elements.feedback.classList.remove('text-success');
  elements.feedback.textContent = errorMessage;
};

const renderFeeds = (elements, i18n, feeds) => {
  const feedsEl = elements.rss.feeds;
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t('content.modal.feeds');
  const listGroop = document.createElement('ul');
  listGroop.classList.add('list-group', 'border-0', 'rounded-0');
  feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;
    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;
    li.append(h3, p);
    listGroop.prepend(li);
  });

  cardBody.append(cardTitle);
  card.append(cardBody, listGroop);
  feedsEl.innerHTML = '';
  feedsEl.append(card);
};

const renderPosts = (elements, i18n, posts, readPosts) => {
  // console.log(posts);
  const postsEl = elements.rss.posts;
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t('content.modal.posts');
  const listGroop = document.createElement('ul');
  listGroop.classList.add('list-group', 'border-0', 'rounded-0');
  posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    a.setAttribute('href', `${post.link}`);
    const className = readPosts.has(post.id) ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
    a.classList.add(...className);
    a.setAttribute('data-id', `${post.id}`);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = post.title;
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.type = 'button';
    button.setAttribute('data-id', `${post.id}`);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18n.t('content.modal.btn_modal');
    li.append(a, button);
    listGroop.prepend(li);
  });

  cardBody.append(cardTitle);
  card.append(cardBody, listGroop);
  // postsEl.innerHTML = '';
  postsEl.replaceChildren(card);
};

const renderModal = (elements, modal) => {
  elements.title.textContent = modal.title;
  elements.body.textContent = modal.description;
  elements.footer.href = modal.link;
};

const render = (elements, i18n) => {
  elements.input.classList.remove('is-invalid');
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.add('text-success');
  elements.feedback.textContent = i18n.t('errors.successURL');
};

const processHandler = (elements, process, i18n) => {
  switch (process) {
    case 'success':
      render(elements, i18n);
      elements.input.disabled = false;
      elements.submit.disabled = false;
      elements.form.reset();
      elements.input.focus();
      break;

    case 'sending':
      elements.input.disabled = true;
      elements.submit.disabled = true;
      break;

    case 'filling':
      elements.input.disabled = false;
      elements.submit.disabled = false;
      break;

    default:
      break;
  }
};

export const initView = (elements, i18n, state) => (path, value) => {
  // console.log(path, value);
  switch (path) {
    case 'form.errors':
      renderErrors(elements, value);
      break;

    case 'form.processState':
      processHandler(elements, value, i18n);
      break;

    case 'feeds':
      renderFeeds(elements, i18n, value);
      break;

    case 'posts':
      renderPosts(elements, i18n, value, state.readPosts);
      break;

    case 'readPosts':
      renderPosts(elements, i18n, state.posts, value);
      break;

    case 'modal':
      renderModal(elements.modal, value);
      break;

    default:
      break;
  }
};

export const renderContent = (elements, i18n) => {
  // console.log(Object.entries(elements.content))
  const { body, modal, footer } = elements.content;
  Object.entries(body).forEach(([key, value]) => {
    const element = value;
    element.textContent = i18n.t(`content.body.${key}`);
  });

  Object.entries(modal).forEach(([key, value]) => {
    const element = value;
    element.textContent = i18n.t(`content.modal.${key}`);
  });
};
