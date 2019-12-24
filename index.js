/**
 * search the selector in the contentTree
 * @param {string} selector
 * @returns {HTMLDivElement} DOM node representing the selector
 */
function searchSelector(selector, contentTree) {

}

/**
 * @param {{
    tagName: string;
    state: number;
    attributes: { name: string, value: string }[];
  }} node
 * @returns {HTMLDivElement}
 */
function getTagDescriptionView(node) {
  const titleContent = document.createElement("span");
  titleContent.appendChild(document.createTextNode(`<${node.tagName}`));

  node.attributes.forEach(a => {
    const name = document.createElement("span");
    name.classList.add("view__attrName");
    name.innerText = ` ${a.name}=`;
    titleContent.appendChild(name);

    const value = document.createElement("span");
    value.classList.add("view__attrValue");
    value.innerText = `"${a.value}"`;
    titleContent.appendChild(value);
  });

  titleContent.appendChild(document.createTextNode(`${node.state === NODE_STATE.selfClosed ? " /" : ""}>`));
  return titleContent;
}

/**
 * @param {HTMLDivElement} node
 */
function toggleElement(node) {
  node.style.display = node.style.display === "block" ? "none" : "block";
}

/**
 * @param {string | {
    tagName: string;
    state: number;
    attributes: { name: string, value: string }[];
    children: (object | string)[]
  }} node
 * @returns {HTMLDivElement}
 */
function getNodeView(node) {
  const result = document.createElement("div");
  const title = document.createElement("div");
  title.classList.add("view__title");

  let titleContent;
  // if node is text
  if (typeof node === "string") {
    title.classList.add("view__title-text");
    titleContent = document.createTextNode(node);
  }
  else {// if node is object
    titleContent = getTagDescriptionView(node);
  }

  title.appendChild(titleContent);
  result.appendChild(title);

  // if node has children
  if (node.children && node.children.length > 0) {
    title.classList.add("view__title-expandable");
    const childrenTreeElement = getTreeView(node.children);

    const expandMarkerElement = document.createElement("div");
    expandMarkerElement.classList.add("view__expandMarker");
    expandMarkerElement.innerText = "...";
    expandMarkerElement.style.display = "none";

    title.appendChild(expandMarkerElement);
    title.addEventListener("click", () => {
      toggleElement(childrenTreeElement);
      toggleElement(expandMarkerElement);
    });

    result.appendChild(childrenTreeElement);
  }

  return result;
}

/**
 * @param {(string | {
    tagName: string;
    state: number;
    attributes: { name: string, value: string }[];
    children: (object | string)[]
  })[]} contentTree
  @returns {HTMLDivElement}
 */
function getTreeView(contentTree) {
  const result = document.createElement("div");
  result.style.marginLeft = 20;
  result.style.display = "block";

  contentTree.forEach(node => {
    result.appendChild(getNodeView(node));
  });

  return result;
}

window.onload = () => {
  const textarea = document.getElementById("textarea");
  const error = document.getElementById("error");
  const view = document.getElementById("view");
  const search = document.getElementById("search");

  search.addEventListener("keyup", () => {
    searchSelector(search.value);
  });

  textarea.addEventListener("keyup", () => {
    error.innerHTML = "";
    try {
      view.innerHTML = "";
      const contentTree = parseHtml(textarea.value);

      if (contentTree.length > 0) {
        view.appendChild(getTreeView(contentTree));
        view.style.visibility = "visible";
        search.style.visibility = "visible";
      }
      else {
        throw new Error(`Content tree is empty`);
      }
    }
    catch (e) {
      view.style.visibility = "hidden";
      search.style.visibility = "hidden";
      error.innerText = e.message;
    }
  });
};
