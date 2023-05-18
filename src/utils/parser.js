export default (page) => {
  const parser = new DOMParser();
  const documentXML = parser.parseFromString(page, 'text/xml');
  const rootTagName = documentXML.documentElement.tagName.toLowerCase();
  if (rootTagName !== 'rss') {
    throw new Error('errors.errorParseRSS');
  }

  const titleChannel = documentXML.querySelector('channel > title').textContent;
  const descriptionChannel = documentXML.querySelector('channel > description').textContent.trim();
  const items = documentXML.getElementsByTagName('item');

  const feed = {
    title: titleChannel,
    description: descriptionChannel,
  };
  const posts = Array.from(items)
    .map((el) => ({
      title: el.querySelector('title').textContent,
      description: el.querySelector('description').textContent.trim(),
      link: el.querySelector('link').textContent,
    }));

  return { feed, posts };
};
