/**
 * @param {{
    tagName: string;
    state: number;
    attributes: { name: string, value: string }[];
  }} node
 * @returns {HTMLDivElement}
 */
function getTagDescriptionElement(node) {
  const result = document.createElement("span");
  result.appendChild(document.createTextNode(`<${node.tagName}`));

  node.attributes.forEach(a => {
    const name = document.createElement("span");
    name.classList.add("view__attrName");
    name.innerText = ` ${a.name}=`;
    result.appendChild(name);

    const value = document.createElement("span");
    value.classList.add("view__attrValue");
    value.innerText = `"${a.value}"`;
    result.appendChild(value);
  });

  result.appendChild(document.createTextNode(`${node.state === NODE_STATE.selfClosed ? " /" : ""}>`));
  return result;
}

/**
 * @returns {HTMLDivElement}
 */
function getExpandMarkerElement() {
  const result = document.createElement("div");
  result.classList.add("view__expandMarker");
  result.innerText = "...";
  return result;
}

/**
 * @param {string | {
    selected?: boolean;
    opened: boolean;
    tagName: string;
    state: number;
    attributes: { name: string, value: string }[];
    children: (object | string)[]
  }} node
 * @param {Function} update
 * @returns {HTMLDivElement}
 */
function getNodeView(node, update) {
  const result = document.createElement("div");
  const title = document.createElement("div");
  title.classList.add("view__title");

  if (node.selected) {
    title.classList.add("view__title-selected");
  }

  let titleContent;
  // if node is text
  if (typeof node === "string") {
    title.classList.add("view__title-text");
    titleContent = document.createTextNode(node);
  }
  else {// if node is object
    titleContent = getTagDescriptionElement(node);
  }

  title.appendChild(titleContent);
  result.appendChild(title);

  // if node has children
  if (node.children && node.children.length > 0) {
    title.classList.add("view__title-expandable");

    if (node.opened) {
      result.appendChild(getTreeView(node.children, update));
    }
    else {
      title.appendChild(getExpandMarkerElement());
    }
    title.addEventListener("click", () => {
      node.opened = !node.opened;
      update();
    });
  }
  return result;
}

/**
 * @param {(string | {
    selected?: boolean;
    opened: boolean;
    tagName: string;
    state: number;
    attributes: { name: string, value: string }[];
    children: (object | string)[]
  })[]} contentTree
 * @param {Function} update
 * @returns {HTMLDivElement}
 */
function getTreeView(contentTree, update) {
  const result = document.createElement("div");
  result.style.marginLeft = 20;

  contentTree.forEach(node => {
    result.appendChild(getNodeView(node, update));
  });

  return result;
}

/**
 * @param {HTMLDivElement} container
 * @param {(string | {
    selected?: boolean;
    opened: boolean;
    tagName: string;
    state: number;
    attributes: { name: string, value: string }[];
    children: (object | string)[]
  })[]} contentTree
 */
function updateView(container, contentTree, update) {
  if (contentTree.length > 0) {
    container.innerHTML = "";
    container.appendChild(getTreeView(contentTree, update));
  }
}

window.onload = () => {
  const textarea = document.getElementById("textarea");
  const error = document.getElementById("error");
  const view = document.getElementById("view");
  const search = document.getElementById("search");
  let contentTree = [];

  const update = () => {
    updateView(view, contentTree, update);
  };

  search.addEventListener("keyup", () => {
    findAllBySelector(contentTree, search.value);
    update();
  });

  textarea.addEventListener("keyup", () => {
    error.innerHTML = "";
    let visibility = "visible";
    try {
      contentTree = parseHtml(textarea.value);
      update();

      if (contentTree.length === 0) {
        throw new Error(`Content tree is empty`);
      }
    }
    catch (e) {
      visibility = "hidden";
      error.innerText = e.message;
    }
    view.style.visibility = visibility;
    search.style.visibility = visibility;
  });
};
