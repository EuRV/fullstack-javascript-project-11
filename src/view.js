const renderErrors = (elements, errors) => {
  const errorMessage = errors?.message;
  elements.input.classList.add('is-invalid');
  elements.feedback.classList.add('text-danger');
  elements.feedback.classList.remove('text-success');
  elements.feedback.textContent = errorMessage;
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
      elements.form.reset();
      elements.input.focus();
      break;

    default:
      break;
  }
};

export const initView = (elements, i18n) => (path, value) => {
  console.log(path, value);
  switch (path) {
    case 'form.errors':
      renderErrors(elements, value);
      break;

    case 'form.processState':
      processHandler(elements, value, i18n);
      break;

    default:
      break;
  }
};

export const renderContent = (elements, i18n) => {
  const { body, modal, footer } = elements.content;
  Object.entries(body).forEach(([key, value]) => {
    const element = value;
    element.textContent = i18n.t(`content.body.${key}`);
  });

  Object.entries(modal).forEach(([key, value]) => {
    const element = value;
    element.textContent = i18n.t(`content.modal.${key}`);
  });

  const { a } = footer;
  a.textContent = i18n.t('content.footer.a');
  footer.div.textContent = i18n.t('content.footer.div');
  footer.div.append(a);
};
