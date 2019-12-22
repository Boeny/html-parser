
const VALID_TAGS = ["html", "div"];
const VALID_ATTR = {
  [VALID_TAGS[0]]: [],
  [VALID_TAGS[1]]: ["class", "id"]
};
const NODE_STATE = {
  opened: 0,
  closed: 1,
  selfClosed: 2
};

/**
 * returns state of the tag: opened, closed, self-closed
 * @param {string} tagText
 * @returns {number} state
 */
function getTagState(tagText) {
  const slashMatches = tagText.match(/\//g);
  if (!slashMatches) {
    return NODE_STATE.opened;
  }
  if (slashMatches.length > 1) {
    throw new Error(`Invalid count of slashes found in the tag ${tagText}. There should be only one slash.`);
  }
  if (tagText.match("</")) {
    return NODE_STATE.closed;
  }
  if (tagText.match("/>")) {
    return NODE_STATE.selfClosed;
  }
  throw new Error(`Slash position in the tag ${tagText} is invalid`);
}

/**
 * @param {string} tagName
 * @param {string[]} tagAttrs
 */
function getTagAttributes(tagName, tagAttrs) {
  const validAttr = VALID_ATTR[tagName];

  return tagAttrs.map(a => {
    const attr = a.split(`="`);
    const attrName = attr[0];

    if (!validAttr.includes(attrName)) {
      throw new Error(`Attribute "${attrName}" is not valid for <${tagName}> tag!`);
    }
    if (attr.length > 1) {
      const value = attr[1];

      if (value.match(/.*"$/)) {
        return { [attrName]: value.slice(0, -1) };
      }
    }
    throw new Error(`Incorrect "${attrName}" attribute ${a} in <${tagName}> tag!`);
  });
}

/**
 * returns the node parsed from the first tag found in the text,
 * also returns the rest text without the tag
 * returns { node: null, restText: "" } in case nothing was found
 * @param {string} text to parse
 * @returns node and result text or { node: null, restText: "" }
 * @throws Error - no tags, invalid tag, attr for closed tag
 */
function getNextNode(text) {
  const matches = text.match(/<!?(--)?\s*\/*[^<>]+(--)?\/*>/);
  if (!matches) {
    return { node: null, restText: "" };
  }
  const tag = matches[0];

  // searching for non-space characters
  const tagContent = tag.replace(/[<\/\\>]/g, "");
  let tagName = tagContent.match(/[^\s]+/g);
  if (!tagName) {
    throw new Error(`Tag ${tag} is empty!`);
  }
  tagName = tagName[0];

  if (!VALID_TAGS.includes(tagName)) {
    throw new Error(`Tag <${tagName}> is not valid!`);
  }
  const state = getTagState(tag);
  const attrRegexp = /[^\s]+="[^"]*"/g;
  const tagAttrs = tagContent.match(attrRegexp) || [];

  if (tagAttrs.length > 0 && state === NODE_STATE.closed) {
    throw new Error(`Attributes are not allowed for closed <${tagName}> tag!`);
  }
  const tagOtherContent = tagContent.replace(tagName, "").replace(attrRegexp, "").replace(/\s+/g, "");
  if (tagOtherContent) {
    throw new Error(`Tag content ${tagOtherContent} is not allowed!`);
  }
  const attributes = getTagAttributes(tagName, tagAttrs);

  return {
    node: { tagName, attributes, state, children: [] },
    restText: text.slice(matches.index + tag.length)
  };
}

/**
 * @param {string} text to parse
 * @returns {object | null} ContentTree
 * @throws Error no valid tags, no tags found
 */
function parseHtml(html) {
  const stack = [];
  let text = html;
  let result = null;

  do {
    const { node, restText } = getNextNode(text);
    if (!node) {
      return result;
    }
    text = restText;
    const parentNode = stack[stack.length - 1]; // parentNode | undefined

    if (node.state === NODE_STATE.opened) {
      stack.push(node);
      result = stack[0];
      continue;
    }
    if (node.state === NODE_STATE.selfClosed) {
      if (!parentNode) {
        return node;
      }
      parentNode.children.push(node);
    }
    // node state is "closed"
    if (!parentNode || parentNode.state !== NODE_STATE.opened) {
      throw new Error(`Stack error: opened <${parentNode.tagName}> tag was not found in the stack!`);
    }
    if (node.tagName !== parentNode.tagName) {
      throw new Error(`Closed </${node.tagName}> tag found, instead of </${parentNode.tagName}> tag!`);
    }
    stack.pop();
  }
  while (text.length > 0);

  return result;
}

// --- main

window.onload = () => {
  const container = document.getElementById("root");

  const textarea = document.createElement("textarea");
  textarea.addEventListener("keyup", e => {
    console.log(parseHtml(textarea.value, {}));
  });
  container.appendChild(textarea);
};

const result = {};
try {
  //console.log("getNextNode test");
  //console.log(getNextNode("<div>"));
  //console.log(getNextNode("<html/>"));
  //console.log(getNextNode("<html />"));
  //console.log(getNextNode("</div>"));
  //console.log(getNextNode("</html >"));
  //console.log(getNextNode("</"));
  //console.log(getNextNode("< >"));
  //console.log(getNextNode("</>"));
  //console.log(getNextNode(`<div class="1 1_dd-ss" id="2 2_ss-dd">sdf<div>`));
  //console.log(getNextNode(`<div class="22>sdf<div>`));
  //console.log(getNextNode(`<div id=3"">sdf<div>`));
  //console.log(getNextNode(`<div id=3">sdf<div>`));
  //console.log(getNextNode(`<div id=3>sdf<div>`));
  //console.log(getNextNode(`<div id=>sdf<div>`));
  //console.log(getNextNode(`<div id>sdf<div>`));
  //console.log(getNextNode("<span>"));
  //console.log(getNextNode("< div>"));
  //console.log(getNextNode("< /div>"));
  //console.log(getNextNode("</ div>"));
  //console.log(getNextNode("<>"));
  //console.log(getNextNode("</>"));
  //console.log(getNextNode("<!>"));
  //console.log(getNextNode("<!-->"));
  //console.log(getNextNode("<!-- -->"));
  //console.log(getNextNode("<!-- sdf -->"));
  //console.log(getNextNode(`<div//>`));
  //console.log(getNextNode(`</div/>`));
  //console.log(getNextNode(`<//div>`));
  //console.log(getNextNode(`<div sdfs>`));
  //console.log(getNextNode(`</html sdf="">`));
  //console.log(getNextNode(`<html sdf="">`));
  //console.log(getNextNode(`<html class="" id="">`));

  console.log(parseHtml(`<div class="1 1_dd-ss" id="2 2_ss-dd">sdf<div>`));
}
catch (e) {
  console.warn(e.message);
}
