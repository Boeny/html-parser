function describe(description, test) {
  console.log(description);
  console.log(" ");
  test();
  console.log("---------------");
  console.log(" ");
}

function testIsSuccessfull(message) {
  console.log(`${message} (success)`);
}

function testHasFailed(message) {
  console.error(`${message} (fail)`);
}

/**
 * @param {Function} func
 */
function expect(name, func) {
  if (typeof func !== "function") {
    throw new Error(`Function expected!`);
  }
  return {
    notToThrow: () => {
      try {
        func();
        testIsSuccessfull(`${name} has no errors`);
      }
      catch (e) {
        testHasFailed(`${name} throws an Error!`);
      }
    },
    toThrow: () => {
      try {
        func();
        testHasFailed(`${name} does not throw any errors!`);
      }
      catch (e) {
        testIsSuccessfull(`${name} throws an Error`);
      }
    }
  };
}

function test() {
  describe("getNextTag should return a next tag", () => {
    expect("<div>", () => getNextTag("<div>")).notToThrow();
    expect("<html/>", () => getNextTag("<html/>")).notToThrow();
    expect("<html />", () => getNextTag("<html />")).notToThrow();
    expect("</div>", () => getNextTag("</div>")).notToThrow();
    expect("</html >", () => getNextTag("</html >")).notToThrow();
    expect(`<div class="1 1_dd-ss" id="2 2_ss-dd">sdf<div>`,
      () => getNextTag(`<div class="1 1_dd-ss" id="2 2_ss-dd">sdf<div>`)).notToThrow();
    expect(`<div class="22>sdf<div>`, () => getNextTag(`<div class="22>sdf<div>`)).toThrow();
    expect(`<div id=3"">sdf<div>`, () => getNextTag(`<div id=3"">sdf<div>`)).toThrow();
    expect(`<div id=3">sdf<div>`, () => getNextTag(`<div id=3">sdf<div>`)).toThrow();
    expect(`<div id=3>sdf<div>`, () => getNextTag(`<div id=3>sdf<div>`)).toThrow();
    expect(`<div id=>sdf<div>`, () => getNextTag(`<div id=>sdf<div>`)).toThrow();
    expect(`<div id>sdf<div>`, () => getNextTag(`<div id>sdf<div>`)).toThrow();
    expect("<span>", () => getNextTag("<span>")).toThrow();
    expect("< div>", () => getNextTag("< div>")).notToThrow();
    expect("< /div>", () => getNextTag("< /div>")).toThrow();
    expect("</ div>", () => getNextTag("</ div>")).notToThrow();
    expect("<> (not a tag)", () => getNextTag("<>")).notToThrow();
    expect("</> (empty tag)", () => getNextTag("</>")).toThrow();
    expect("<//> (empty tag)", () => getNextTag("<//>")).toThrow();
    expect("</ (not a tag)", () => getNextTag("</")).notToThrow();
    expect("< > (empty tag)", () => getNextTag("< >")).toThrow();
    expect("<!>", () => getNextTag("<!>")).toThrow();
    expect("<!-->", () => getNextTag("<!-->")).toThrow();
    expect("<!-- -->", () => getNextTag("<!-- -->")).toThrow();
    expect("<!-- sdf -->", () => getNextTag("<!-- sdf -->")).toThrow();
    expect(`<div//>`, () => getNextTag(`<div//>`)).toThrow();
    expect(`</div/>`, () => getNextTag(`</div/>`)).toThrow();
    expect(`<//div>`, () => getNextTag(`<//div>`)).toThrow();
    expect(`<div sdfs>`, () => getNextTag(`<div sdfs>`)).toThrow();
    expect(`</html sdf="">`, () => getNextTag(`</html sdf="">`)).toThrow();
    expect(`<html sdf="">`, () => getNextTag(`<html sdf="">`)).toThrow();
    expect(`<html class="" id="">`, () => getNextTag(`<html class="" id="">`)).toThrow();
  });
  describe("parseHtml should return a content tree", () => {
    expect("<div>ertet", () => parseHtml("<div>ertet")).toThrow();
    expect(`<div class="1 1_dd-ss" id="2 2_ss-dd">sdf</div>`,
      () => parseHtml(`<div class="1 1_dd-ss" id="2 2_ss-dd">sdf</div>`)).notToThrow();
    expect(`<div class="1 1_dd-ss" id="2 2_ss-dd">sdf<div>`,
      () => parseHtml(`<div class="1 1_dd-ss" id="2 2_ss-dd">sdf<div>`)).toThrow();
    expect(`</div>sdf</div>`, () => parseHtml(`</div>sdf</div>`)).toThrow();
    expect(`<div>1</div><div>2</div>`, () => parseHtml(`<div>1</div><div>2</div>`)).notToThrow();
    expect(`<div>1<div/>2</div>`, () => parseHtml(`<div>1<div/>2</div>`)).notToThrow();
    expect(`<div>1<div id=""/>2</div>`, () => parseHtml(`<div>1<div id=""/>2</div>`)).notToThrow();
    expect(`<div>1<div>2</div>3</div>`, () => parseHtml(`<div>1<div>2</div>3</div>`)).notToThrow();
    expect(`<div class="" />`, () => parseHtml(`<div class="" />`)).notToThrow();
    expect(`<html class="" />`, () => parseHtml(`<html class="" />`)).toThrow();
    expect(`<html />`, () => parseHtml(`<html />`)).notToThrow();
  });
}

test();
