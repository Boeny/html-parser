
function toggleNode(node) {
  node.style.display = node.style.display === "block" ? "none" : "block";
}

function getNodeView(node) {
  const result = document.createElement("div");
  const title = document.createElement("div");
  title.classList.add("view__title");

  if (typeof node === "string") {
    title.appendChild(document.createTextNode(node));
    result.appendChild(title);
    return result;
  }

  title.style.color = "#9C27B0";
  const selfClosed = node.state === NODE_STATE.selfClosed;

  title.appendChild(document.createTextNode(
    `<${node.tagName} ${node.attributes.join(" ")}${selfClosed ? " /" : ""}>`
  ));
  result.appendChild(title);

  if (node.children.length > 0) {
    title.classList.add("view__title-expandable");
    const childrenTree = getTreeView(node.children);
    result.appendChild(childrenTree);

    const expandMarker = document.createElement("div");
    expandMarker.innerText = "...";
    expandMarker.style.display = "none";

    title.appendChild(expandMarker);
    title.addEventListener("click", () => {
      toggleNode(childrenTree);
      toggleNode(expandMarker);
    });
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
  @returns {object | null} DOM element or null
 */
function getTreeView(contentTree) {
  if (contentTree.length === 0) {
    return null;
  }
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

  textarea.addEventListener("keyup", e => {
    error.innerHTML = "";
    try {
      view.innerHTML = "";
      const contentTree = parseHtml(textarea.value);

      if (contentTree.length > 0) {
        view.appendChild(getTreeView(contentTree));
        view.style.visibility = "visible";
      }
      else {
        view.style.visibility = "hidden";
      }
    }
    catch (e) {
      view.style.visibility = "hidden";
      error.insertAdjacentText("afterbegin", e.message);
    }
  });
};
