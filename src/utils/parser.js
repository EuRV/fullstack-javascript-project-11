const mapping = {
  feeds: {
    title: (el) => (key) => el.querySelector(`channel > ${key}`).textContent,
    description: (el) => (key) => el.querySelector(`channel > ${key}`).textContent,
  },
  posts: {
    title: (el) => (key) => el.querySelector(key).textContent,
    description: (el) => (key) => el.querySelector(key).textContent,
    link: (el) => (key) => el.querySelector(key).textContent,
  },
};

const patern = {
  feeds: [
    'title',
    'description',
  ],
  posts: [
    'title',
    'description',
    'link',
  ],
};

export default (page) => {
  const parser = new DOMParser();
  const domFromXML = parser.parseFromString(page, 'text/xml');
  const items = domFromXML.getElementsByTagName('item');
  const feeds = patern.feeds
    .reduce((acc, tagName) => (
      { ...acc, [tagName]: mapping.feeds[tagName](domFromXML)(tagName) }
    ), {});
  const posts = Array.from(items)
    .map((el) => patern.posts.reduce((acc, tagName) => (
      { ...acc, [tagName]: mapping.posts[tagName](el)(tagName) }
    ), {}));
  // { idFeed: '', id: '', title: '', description: '', link: '' };
  // return domFromXML;
  return { feeds, posts };
};
