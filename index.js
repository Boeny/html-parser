
function getNodeView(node) {
  const result = document.createElement("div");
  const title = document.createElement("div");
  title.classList.add("view__title");

  if (typeof node === "string") {
    title.appendChild(document.createTextNode(node));
    result.appendChild(title);
  }
  else {
    const selfClosed = node.state = NODE_STATE.selfClosed;
    if (selfClosed) {
      title.style.cursor = "pointer";
    }
    title.appendChild(document.createTextNode(
      `<${node.tagName} ${node.attributes.join(" ")}${selfClosed ? " /" : ""}>`
    ));
    result.appendChild(title);
    result.appendChild(getTreeView(node.children));
  }
  return result;
}

/**
 * @param {(string | {
    tagName: string;
    tagText: string;
    state: number;
    attributes: string;
    textBeforeTag: string;
    children: (object | string)[]
  })[]} contentTree
  @returns {object} DOM element
 */
function getTreeView(contentTree) {
  const result = document.createElement("div");
  result.style.marginLeft = 20;

  contentTree.forEach(node => {
    result.appendChild(getNodeView(node));
  });

  return result;
}

window.onload = () => {
  const textarea = document.getElementById("textarea");
  const error = document.getElementById("error");
  const view = document.getElementById("view");

  textarea.addEventListener("keyup", e => {
    error.innerHTML = "";
    try {
      view.innerHTML = "";
      console.log(parseHtml(textarea.value));
      view.appendChild(getTreeView(parseHtml(textarea.value)));
      view.style.visibility = "visible";
    }
    catch (e) {
      view.style.visibility = "hidden";
      error.insertAdjacentText("afterbegin", e.message);
    }
  });
};
