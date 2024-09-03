import $ from "jquery";

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
import ReliaAutoCorrSink from "./AutoCorrSink.js";

import FrequencySinkLite from "./FrequencySinkLite.js";
import VectorSinkLite from "./VectorSinkLite.js";
export function ReliaWidgetsLite($divElement) {
  var self = this;
  var devicesUrl = window.API_BASE_URL + "data/current/devices";
  self.blocks = [];

  $.get(devicesUrl).done(function (data) {
    if (!data.success) {
      // TODO
      console.log("Error loading devices:", data);
      return;
    }

    var devices = data.devices;
    $.each(devices, function (pos, deviceName) {
      var $deviceContents = $('<div class="row">' + "<h3>" + deviceName + "</h3>" + "</div>");
      $divElement.append($deviceContents);
      var blocksUrl = window.API_BASE_URL + "data/current/devices/" + deviceName + "/blocks";
      $.get(blocksUrl).done(function (data) {
        if (!data.success) {
          // TODO
          console.log("Error loading blocks:", data);
          return;
        }
        $.each(data.blocks, function (post, blockName) {
          var $newDiv = $(
            '<div class="col-xs-12 col-sm-6 col-lg-4" style="padding: 10px">' +
              '<div style="width: 100%; border: 1px solid black; border-radius: 20px; background: #eee; padding: 10px">' +
              "<h5>" +
              blockName +
              "</h5>" +
              '<div class="block-contents" style="width: 100%"></div>' +
              "</div>" +
              "</div>"
          );
          $deviceContents.append($newDiv);
          var $divContents = $newDiv.find(".block-contents");
          console.log("Loading...", deviceName, blockName);

          if (blockName.startsWith("Frequency Sink")) {
            var frequencysink = new FrequencySinkLite($divContents, deviceName, blockName);
            self.blocks.push(frequencysink);
            frequencysink.redraw();
          } else if (blockName.startsWith("RELIA Vector Sink")) {
            var vectorSink = new VectorSinkLite($divContents, deviceName, blockName);
            self.blocks.push(vectorSink);
            vectorSink.redraw();
          }
        });
      });
    });
  });
}
