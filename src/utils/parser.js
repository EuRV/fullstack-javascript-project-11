export default (page) => {
  const parser = new DOMParser();
  const domFromXML = parser.parseFromString(page, 'text/xml');
  const titleChannel = domFromXML.querySelector('channel > title').textContent;
  const descriptionChannel = domFromXML.querySelector('channel > description').textContent;
  const items = domFromXML.getElementsByTagName('item');

  const feed = {
    title: titleChannel,
    description: descriptionChannel,
  };
  const posts = Array.from(items)
    .map((el) => ({
      title: el.querySelector('title').textContent,
      description: el.querySelector('description').textContent,
      link: el.querySelector('link').textContent,
    }));

  return { feed, posts };
};
