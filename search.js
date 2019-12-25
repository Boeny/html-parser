/**
 * @param {string} text
 * @returns {{ token: string | null, index: number } last token
 */
function parseLastToken(text) {
  const matches = text.trim().match(/[\#\.]?[\w\-\_]+$/);
  return {
    token: matches ? matches[0] : null,
    index: matches ? matches.index : 0
  };
}

/**
 * @param {{
    selected?: boolean;
    tagName: string;
    state: number;
    attributes: { name: string, value: string }[];
    children: (object | string)[]
  }[]} contentTree
 * @param {string} token
 */
function findAllByToken(contentTree, token) {
  const result = [];

  contentTree.forEach(node => {
    if (typeof node === "string") {
      result.push(node);
      return;
    }
    const resultNode = { ...node };

    if (resultNode.tagName === token) {
      resultNode.selected = true;
    }
    if (resultNode.attributes.length > 0) {
      resultNode.attributes.forEach(a => {
        if (a.name === "id" && `#${a.value}` === token || a.name === "class" && `.${a.value}` === token) {
          resultNode.selected = true;
        }
      });
    }
    if (resultNode.children.length > 0) {
      resultNode.children = findAllByToken(resultNode.children, token);
    }
    result.push(resultNode);
  });

  return result;
}

/**
 * search the selector in the contentTree
 * @param {{
    selected?: boolean;
    tagName: string;
    state: number;
    attributes: { name: string, value: string }[];
    children: (object | string)[]
  }[]} contentTree
 * @param {string} selector
 */
function findAllBySelector(contentTree, selector) {
  let text = selector;
  let result = contentTree.slice();
  do {
    const { token, index } = parseLastToken(text);
    if (!token) {
      return null;
    }
    result = findAllByToken(result, token);
    text = text.slice(0, index);
  }
  while (text);

  return result;
}
