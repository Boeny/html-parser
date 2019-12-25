/**
 * @param {string} text
 * @returns {{ token: string | null, index: number } last token
 */
function parseLastToken(text) {
  const matches = text.trim().match(/^[\#\.]?[\w\-\_]+$/);
  return {
    token: matches ? matches[0] : null,
    index: matches ? matches.index : 0
  };
}

/**
 * @param {{
    selected?: boolean;
    opened: boolean;
    tagName: string;
    state: number;
    attributes: { name: string, value: string }[];
    children: (object | string)[]
  }[]} contentTree
 * @param {string} token
 @returns {boolean} found
 */
function findAllByToken(contentTree, token) {
  let found = false;

  contentTree.forEach(node => {
    if (typeof node === "string") {
      return;
    }
    node.selected = undefined;

    if (node.tagName === token) {
      found = true;
      node.selected = true;
    }
    if (node.attributes.length > 0) {
      node.attributes.forEach(a => {
        if (a.name === "id" && `#${a.value}` === token || a.name === "class" && `.${a.value}` === token) {
          found = true;
          node.selected = true;
        }
      });
    }
    if (findAllByToken(node.children, token)) {
      found = true;
      node.opened = true;
    }
  });

  return found;
}

function clearSelected(contentTree) {
  contentTree.forEach(node => {
    if (typeof node === "string") {
      return;
    }
    node.selected = undefined;
    clearSelected(node.children);
  });
}

/**
 * search the selector in the contentTree
 * @param {{
    selected?: boolean;
    opened: boolean;
    tagName: string;
    state: number;
    attributes: { name: string, value: string }[];
    children: (object | string)[]
  }[]} contentTree
 * @param {string} selector
 */
function findAllBySelector(contentTree, selector) {
  let text = selector;
  do {
    const { token, index } = parseLastToken(text);
    if (!token) {
      clearSelected(contentTree);
      return;
    }
    findAllByToken(contentTree, token);
    text = text.slice(0, index);
  }
  while (text);
}
