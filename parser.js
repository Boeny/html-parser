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
 * @throws {Error} - invalid slash count, invalid slash position
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
 * @returns {{ name: string, value: string }[]} attributes
 * @throws {Error} - invalid attr, incorrect attr
 */
function getTagAttributes(tagName, tagAttrs) {
  const validAttr = VALID_ATTR[tagName];

  return tagAttrs.map(a => {
    const attrParts = a.split(`="`);
    const name = attrParts[0];

    if (!validAttr.includes(name)) {
      throw new Error(`Attribute "${name}" is not valid for <${tagName}> tag!`);
    }
    if (attrParts.length > 1) {
      const value = attrParts[1];

      if (value.match(/.*"$/)) {
        return { name, value: value.slice(0, -1) };
      }
    }
    throw new Error(`Incorrect "${name}" attribute ${a} in <${tagName}> tag!`);
  });
}

/**
 * returns next tag found in the text, also returns the rest text without the tag
 * returns { nextTag: null, restText: "" } in case nothing was found
 * @param {string} text to parse
 * @returns next tag and result text or { nextTag: null, restText: "" }
 * @throws {Error} - empty tag, invalid tag, attr for closed tag, invalid tag content
 */
function getNextTag(text) {
  const matches = text.match(/<!?(--)?\/*[^<>]+(--)?\/*>/);
  if (!matches) {
    return { nextTag: null, restText: "" };
  }
  const tagText = matches[0];

  // search for non-space characters
  const tagContent = tagText.replace(/[<\/\\>]/g, "");
  let tagName = tagContent.match(/[^\s]+/g);
  if (!tagName) {
    throw new Error(`Tag ${tagText} is empty!`);
  }
  tagName = tagName[0];

  if (!VALID_TAGS.includes(tagName)) {
    throw new Error(`Tag <${tagName}> is not valid${`<${tagName}>` !== tagText ? ` (used as ${tagText})` : ""}!`);
  }
  const state = getTagState(tagText);
  const attrRegexp = /[^\s]+="[^"]*"/g;
  const tagAttrs = tagContent.match(attrRegexp) || [];

  if (tagAttrs.length > 0 && state === NODE_STATE.closed) {
    throw new Error(`Attributes are not allowed for closed <${tagName}> tag!`);
  }
  const tagOtherContent = tagContent.replace(tagName, "").replace(attrRegexp, "").replace(/\s+/g, "");
  if (tagOtherContent) {
    throw new Error(`Tag content ${tagOtherContent} is invalid!`);
  }

  return {
    nextTag: {
      tagName,
      tagText,
      state,
      attributes: getTagAttributes(tagName, tagAttrs),
      textBeforeTag: text.slice(0, matches.index),
      children: []
    },
    restText: text.slice(matches.index + tagText.length)
  };
}

/**
 * sets the text before the nextTag as a child of the lastStackElem
 * @param {{ children: any[] } | null} lastStackElem
 * @param {{ textBeforeTag: string }} nextTag
 */
function saveInnerText(lastStackElem, nextTag) {
  if (lastStackElem && nextTag.textBeforeTag.replace(/[\r\n\s]+/g, "") !== "") {
    lastStackElem.children.push(nextTag.textBeforeTag);
  }
}

/**
 * @param {string} text to parse
 * @returns {{
    tagName: string;
    tagText: string;
    state: number;
    attributes: {
        name: string;
        value: string;
    }[];
    textBeforeTag: string;
    children: any[];
 * }[]} ContentTree
 * @throws {Error} - stack, overflow, no opened tag, different opened and closed tags
 */
function parseHtml(html) {
  const stack = [];
  let text = html;
  let result = [];

  do {
    const { nextTag, restText } = getNextTag(text);
    if (!nextTag) {
      break;
    }
    text = restText;
    const parentTag = stack.length > 0 ? stack[stack.length - 1] : null;

    if (nextTag.state === NODE_STATE.opened) {
      saveInnerText(parentTag, nextTag);
      stack.push(nextTag);
      continue;
    }
    if (nextTag.state === NODE_STATE.selfClosed) {
      // save top-level node
      if (parentTag) {
        saveInnerText(parentTag, nextTag);
        parentTag.children.push(nextTag);
      }
      else {
        result.push(nextTag);
      }
      continue;
    }
    // node state is "closed"
    if (!parentTag || parentTag.state !== NODE_STATE.opened) {
      throw new Error(`Opened <${nextTag.tagName}> tag was not found!`);
    }
    if (nextTag.tagName !== parentTag.tagName) {
      throw new Error(`Closed ${nextTag.tagText} tag found, instead of ${parentTag.tagText} tag!`);
    }
    saveInnerText(parentTag, nextTag);
    // remove current tag from the stack
    stack.pop();
    // save top-level tag
    if (stack.length === 0) {
      result.push(parentTag);
    }
    else {
      stack[stack.length - 1].children.push(parentTag);
    }
  }
  while (text.length > 0);

  if (stack.length > 0) {
    throw new Error(`Closed tag for ${stack.map(n => n.tagText).join(", ")} not found!`)
  }
  return result;
}
