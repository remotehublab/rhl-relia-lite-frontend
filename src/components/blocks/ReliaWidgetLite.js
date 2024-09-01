import $ from "jquery";

class ReliaWidgetLite {
  constructor($divElement, blockIdentifier, blockJson) {
    this.$div = $divElement;
    this.blockIdentifier = blockIdentifier;
    this.block = blockJson;
    // window.API_BASE_URL +
    // "data/tasks/" +
    // taskIdentifier +
    // "/devices/" +
    // deviceIdentifier +
    // "/blocks/" +
    // blockIdentifier;
    this.running = false;
  }

  start() {
    this.running = true;
    this.redraw();
    this.performRequest();
  }

  performRequest() {
    var self = this;

    if (!self.running) return;
    if (!self.block) return;

    console.log("performing request, self.block: ", self.block);

    if (!self.block.success) {
      console.log("Block was not successfull");
      return;
    }

    if (self.block.data == null) return;

    // call redraw just after
    setTimeout(function () {
      self.redraw();
      self.performRequest();
    });

    console.log("handling data!");
    self.handleResponseData(self.block);
  }

  /*
   * redraw the widget. Optional method.
   */
  redraw() {}

  /*
   * handle the response data from the call to self.url. Mandatory method.
   */
  handleResponseData(response) {
    console.log("ReliaWidget::handleResponseData() called. About to raise an error");
    throw "handleNewData not implemented";
  }

  stop() {
    this.running = false;
  }

  /*
   * Mandatory method. Translated name
   */
  translatedName() {
    // by default we provide the block identifier
    return this.englishName();
  }

  /*
   * No need to do anything with this function
   */
  englishName() {
    return this.blockIdentifier.split("(")[0];
  }

  /*
   * No need to do anything with this function
   */
  translatedIdentifier() {
    return this.blockIdentifier.replace(this.englishName(), this.translatedName());
  }
}

export default ReliaWidgetLite;
