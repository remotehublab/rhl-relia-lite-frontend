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
    this.startTime = 0;
  }

  start() {
    this.running = true;
    this.startTime = new Date().getTime();
    this.redraw();
    this.performRequest();
  }

  performRequest() {
    var self = this;

    if (!self.running) return;
    if (!self.block) return;

    var elapsedTimeInMillis = new Date().getTime() - self.startTime;
    var selectedBlock = self.block.timedData[0];
    for (var i = 0; i < self.block.timedData.length; i++) {
      if (self.block.timedData[i].t * 1000 > elapsedTimeInMillis) {
        break;
      }
      selectedBlock = self.block.timedData[i];
    }

    console.log("selectedBlock for", self.blockIdentifier, " t=", selectedBlock.t, "elapsedTimeInMillis: ", elapsedTimeInMillis);

    var currentMomentData = selectedBlock.data.data;

    console.log("performing request, self.block: ", currentMomentData);

    if (currentMomentData.data == null) return;

    // call redraw just after
    setTimeout(function () {
      self.redraw();
      self.performRequest();
    }, 1000);

    console.log("handling data!");
    self.handleResponseData(currentMomentData);
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
