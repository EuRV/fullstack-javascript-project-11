const renderErrors = (elements, errors) => {
  const errorMessage = errors?.message;
  elements.input.classList.add('is-invalid');
  elements.feedback.classList.add('text-danger');
  elements.feedback.classList.remove('text-success');
  elements.feedback.textContent = errorMessage;
  // console.log(elements.feedback);
};

const render = (elements) => {
  elements.input.classList.remove('is-invalid');
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.add('text-success');
  elements.feedback.textContent = 'RSS успешно загружен';
};

const processHandler = (elements, process) => {
  switch (process) {
    case 'success':
      render(elements);
      elements.form.reset();
      elements.input.focus();
      break;

    default:
      break;
  }
};

export default (elements) => (path, value) => {
  console.log(path, value);
  switch (path) {
    case 'form.errors':
      renderErrors(elements, value);
      break;

    case 'form.processState':
      processHandler(elements, value);
      break;

    default:
      break;
  }
};
