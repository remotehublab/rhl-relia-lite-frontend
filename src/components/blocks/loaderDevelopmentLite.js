import $ from "jquery";

import { t } from "../../i18n.js";

import ReliaConstellationSink from "./ConstellationSink.js";
import ReliaTimeSink from "./TimeSink.js";
import ReliaVectorSink from "./VectorSink.js";
import ReliaVariableRange from "./VariableRange.js";
import ReliaHistogramSink from "./HistogramSink.js";
import ReliaCheckBox from "./VariableCheckBox.js";
import ReliaPushButton from "./VariablePushButton.js";
import ReliaChooser from "./VariableChooser.js";
import ReliaNumberSink from "./NumberSink.js";
import ReliaEyePlot from "./EyePlot.js";
import ReliaFrequencySink from "./FrequencySink.js";

import FrequencySinkLite from "./FrequencySinkLite.js";
import ReliaVectorSinkLite from "./VectorSinkLite.js";

// how fast it should ask for devices
var CHECK_DEVICES_TIME_MS = 500;

window.RELIA_WIDGETS_COUNTER = 0;

export class ReliaWidgets {
  constructor($divElement, taskId, currentSessionRef) {
    window.RELIA_WIDGETS_COUNTER = window.RELIA_WIDGETS_COUNTER + 1;
    this.identifier = window.RELIA_WIDGETS_COUNTER;
    this.taskId = taskId;
    this.currentSessionRef = currentSessionRef;

    this.blocksById = {};
    this.running = false;
    this.$divElement = $divElement;
    this.blocks = [];
    this.prerecordedData = {};
    this.url =
      process.env.REACT_APP_RECORDINGS_BASE_URL +
      this.currentSessionRef.current.configurationFoldername +
      "/" +
      this.currentSessionRef.current.dataUrl;
    console.log("loaderDev url: ", this.url);

    console.log(
      "new ReliaWidgets() with identifier ",
      this.identifier,
      "length:",
      $divElement.length
    );
  }

  clean() {
    this.blocksById = {};
    this.blocks = [];

    this.$divElement.find("#relia-widgets-receiver").empty();
    this.$divElement.find("#relia-widgets-transmitter").empty();
  }

  /*
   * start() will start the process
   */
  start() {
    var self = this;
    if (!this.running) {
      console.log("Starting ReliaWidgets(id=" + this.identifier + ")");
      this.running = true;

      $.get(self.url).done(function (data) {
        self.prerecordedData = data;
        console.log("From dataUrl got data: ", data);
        self.process();
      });
    }
  }

  /*
   * stop()
   */
  stop() {
    console.log("Stopping ReliaWidgets(id=" + this.identifier + ")");
    if (this.running) {
      this.running = false;

      for (var i = 0; i < this.blocks.length; i++) {
        var block = this.blocks[i];
        block.stop();
      }
    }
  }

  /*
   * process() is run quite often (defined by CHECK_DEVICES_TIME_MS + time taken by the server to respond), will ask the server
   * if there are devices, etc.
   */
  process() {
    console.log("processing!");
    var self = this;

    if (!self.running) return;
    if (!self.prerecordedData) return;

    // TODO: improve (we can calculate when to run this next)
    setTimeout(function () {
      self.process();
    }, CHECK_DEVICES_TIME_MS);

    $.each(Object.keys(self.prerecordedData), function (pos, deviceType) {
      console.log("Position:", pos, "Key:", deviceType, "Object:", self.prerecordedData[deviceType]);
      var $deviceContents;
      // deviceName is transmitter or receiver
      var deviceName = deviceType[0];
      console.log("deviceName: ", deviceName);
      var deviceNameIdentifier =
        "device-" +
        deviceName
          .replaceAll(":", "-")
          .replaceAll(" ", "-")
          .replaceAll("[", "-")
          .replaceAll("]", "-");
      if (!self.blocksById[deviceName]) {
        console.log(
          "device name ",
          deviceName,
          " not found in self.blocksById of ReliaWidgets(id= ",
          self.identifier,
          "). Creating new block with identifier: ",
          deviceNameIdentifier
        );
        var $deviceContainer = self.$divElement.find("#relia-widgets-" + deviceType);
        $deviceContents = $("<div id='" + deviceNameIdentifier + "'>" + "</div>");
        $deviceContainer.append($deviceContents);
        self.blocksById[deviceName] = {};
      } else {
        $deviceContents = $("#" + deviceNameIdentifier);
      }

      if (!self.running) return;

      console.log("Listing blocks in ", deviceName);
      console.log("self.blocksById: ", self.blocksById);
      console.log("self.blocks: ", self.blocks);
      $.each(self.prerecordedData[deviceType], function (post, blockJson) {
        console.log("Block", blockJson, " at pos: ", post, " for device: ", deviceType);
        const blockName = blockJson.name;
        console.log("blockName: ", blockName);
        if (self.blocksById[deviceName] && !self.blocksById[deviceName][blockName]) {
          console.log(
            "Block",
            blockName,
            " found at ",
            deviceName,
            "was NOT included, so we include it now"
          );
          var $newDiv = $(
            '<div class="" style="padding: 10px">' +
              '<div style="width: 100%; border: 1px solid black; border-radius: 20px; background: #eee; padding: 10px">' +
              "<h5 class='deviceTitle'></h5>" +
              '<div class="block-contents" style="width: 100%"></div>' +
              "</div>" +
              "</div>"
          );
          $deviceContents.append($newDiv);
          var $divContents = $newDiv.find(".block-contents");
          // console.log("Loading...", deviceName, blockName);
          var block; // a block inherits from ReliaWidget
          if (blockName.startsWith("RELIA Vector Sink")) {
            block = new ReliaVectorSinkLite(
              $divContents,
              blockName,
              blockJson
            );
          } else if (blockName.startsWith("Frequency Sink")) {
            block = new FrequencySinkLite(
              $divContents,
              blockName,
              blockJson
            );
          } else {
            // Add more blocks here
            console.log("Unsupported block: ", blockName);
            return;
          }

          ////////// Old Blocks /////////////
          //   if (blockName.startsWith("RELIA Constellation Sink")) {
          //     block = new ReliaConstellationSink(
          //       $divContents,
          //       deviceName,
          //       blockName,
          //       self.taskId
          //     );
          //   } else if (blockName.startsWith("RELIA Time Sink")) {
          //     block = new ReliaTimeSink($divContents, deviceName, blockName, self.taskId);
          //   } else if (blockName.startsWith("RELIA Variable Range")) {
          //     block = new ReliaVariableRange($divContents, deviceName, blockName, self.taskId);
          //   } else if (blockName.startsWith("RELIA Histogram Sink")) {
          //     block = new ReliaHistogramSink($divContents, deviceName, blockName, self.taskId);
          //   } else if (blockName.startsWith("RELIA Variable CheckBox")) {
          //     block = new ReliaCheckBox($divContents, deviceName, blockName, self.taskId);
          //   } else if (blockName.startsWith("RELIA Variable PushButton")) {
          //     block = new ReliaPushButton($divContents, deviceName, blockName, self.taskId);
          //   } else if (blockName.startsWith("RELIA Variable Chooser")) {
          //     block = new ReliaChooser($divContents, deviceName, blockName, self.taskId);
          //   } else if (blockName.startsWith("RELIA Number Sink")) {
          //     block = new ReliaNumberSink($divContents, deviceName, blockName, self.taskId);
          //   } else if (blockName.startsWith("RELIA Eye Plot")) {
          //     block = new ReliaEyePlot($divContents, deviceName, blockName, self.taskId);
          //   } else {
          //     // Add more blocks here
          //     console.log("Unsupported block: ", blockName);
          //     return;
          //   }
          $newDiv.find("h5.deviceTitle").text(block.translatedIdentifier());
          self.blocks.push(block);
          self.blocksById[deviceName][blockName] = block;
          block.start();
        } else {
          if (self.blocksById[deviceName]) {
            var block = self.blocksById[deviceName][blockName];
            if (block && !block.running) block.start();
          }
        }
      });
      //});
    });
  }
}
