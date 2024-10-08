import React, { useEffect, useRef, useState } from "react";

// for  translations
import i18n, { t } from "./i18n";
import { withTranslation } from "react-i18next";

import { Container, Row, Col } from "react-bootstrap";

import { ReliaWidgets } from "./components/blocks/loaderDevelopment";
import $ from "jquery";

/**
 * Renders the Introduction component.
 *
 * This component will display the lab
 *
 * @returns {JSX.Element} The rendered Introduction component.
 */
function Laboratory({
  currentSession,
  setCurrentSession,
  reliaWidgets,
  setReliaWidgets,
  fileStatus,
  setFileStatus,
  manageTask,
  checkStatus,
}) {
  const [cameraURLSeed, setCameraURlSeed] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraURL, setCameraUrl] = useState(currentSession.cameraUrl);
  const cameraShouldRunRef = useRef(null);
  const currentSessionStatusRef = useRef(null);
  const cameraUrlRef = useRef(null);
  const intervalIdRef = useRef(null);

  const handleCameraButtonClick = () => {
    let newShowCamera = !showCamera;
    setShowCamera(newShowCamera);

    if (newShowCamera) {
      cameraShouldRunRef.current = true;
      if (shouldCameraReloadInCurrentStatus()) {
        setCameraUrl(getCameraURL());
      }
    } else {
      cameraShouldRunRef.current = false;
    }
  };

  const refreshTask = () => {
    if (reliaWidgets !== null) {
      reliaWidgets.stop();
      reliaWidgets.clean();
    }

    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user/tasks/`, {
      method: "POST",
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          // TODO
          console.log("Failed to fetch: Status " + response.status);
          setFileStatus(<a>Error sending files, please try again</a>);
        }
      })
      .then((data) => {
        if (data && data.success) {
          const newSession = {
            taskIdentifier: data.taskIdentifier,
            status: data.status,
            message: data.message,
            assignedInstance: null,
            assignedInstanceName: t("runner.no-instance-yet"),
            transmitterFilename: null,
            receiverFilename: null,
            cameraUrl: null,
            renderingWidgets: currentSession.renderingWidgets,
          };
          setCurrentSession(newSession);

          Object.assign(currentSession, newSession);
          console.log(currentSession);
          setTimeout(checkStatus, 1000);

          const newReliaWidgets = new ReliaWidgets(
            $("#relia-widgets"),
            data.taskIdentifier,
            currentSessionRef
          );
          newReliaWidgets.start();
          setReliaWidgets(newReliaWidgets);
        } else {
          if (setFileStatus) {
            setFileStatus(<a>Error sending files, please try again</a>);
          }
          console.error("Failed to create task");
        }
      });
  };

  const shouldCameraReloadInCurrentStatus = () => {
    let currentStatus = currentSessionStatusRef.current;
    return (
      currentStatus == "receiver-assigned" ||
      currentStatus == "fully-assigned" ||
      currentStatus == "receiver-still-processing" ||
      currentStatus == "transmitter-still-processing"
    );
  };

  const onImageLoaded = () => {
    // Only when the image is loaded (or there is an error), try to reload the image again after 50ms
    // but only if at that moment we are still in the right conditions
    setTimeout(function () {
      if (cameraShouldRunRef.current && shouldCameraReloadInCurrentStatus()) {
        setCameraUrl(getCameraURL());
        // for some reason setCameraUrl goes super slow to refresh, so we manipulate DOM directly
        document.getElementById("camera-image").src = getCameraURL();
      }
    }, 50);
  };

  const getCameraURL = () => {
    return cameraUrlRef.current + "?t=" + new Date().toString();
  };

  function convertStatusMessage(status) {
    switch (status) {
      case "error":
        return "runner.messages.there-was-an-error-running-your-gnu-radio-code";
      case "stopped":
        return "runner.messages.your-gnu-radio-code-has-stopped";
      case "deleted":
        return "runner.messages.your-gnu-radio-code-is-not-running-anymore-feel-free-to-run-it-again";
      case "receiver-assigned":
        return "runner.messages.remote-set-up-assigned-waiting-to-start-running-your-gnu-radio-code";
      case "fully-assigned":
        return "runner.messages.your-gnu-radio-code-is-now-running-in-both-remote-devices";
      case "receiver-still-processing":
        return "runner.messages.the-remote-set-up-is-processing-your-GNU-Radio-in-the-receiver-device";
      case "transmitter-still-processing":
        return "runner.messages.the-remote-set-up-is-processing-your-GNU-Radio-in-the-transmitter-device";
      case "starting":
        return "runner.messages.starting-to-run-again-your-gnu-radio-code";
      case "stopping":
        return "runner.messages.stopping";
      case "queued":
        return "runner.messages.waiting-for-a-remote-set-up-to-be-available";
      case "processing":
        return "runner.messages.your-gnu-radio-files-are-being-processed-please-wait";
      case "completed":
        return "runner.messages.your-gnu-radio-code-is-not-running-anymore-feel-free-to-run-it-again";
      default:
        return "Status not recognized";
    }
  }

  const currentSessionRef = useRef(currentSession);
  currentSessionRef.current = currentSession;
  currentSessionStatusRef.current = currentSession.status;

  useEffect(() => {
    //console.log("Calling useEffect in Laboratory");
    //console.log(reliaWidgets);
    if (reliaWidgets !== null) reliaWidgets.stop();

    const newReliaWidgets = new ReliaWidgets(
      $("#relia-widgets"),
      currentSession.taskIdentifier,
      currentSessionRef
    );
    newReliaWidgets.start();
    setReliaWidgets(newReliaWidgets);

    return () => {
      newReliaWidgets.stop();
      newReliaWidgets.clean();
    };
  }, []);

  useEffect(() => {
    if (
      currentSession.status == "completed" ||
      currentSession.status == "error" ||
      currentSession.status == "deleted"
    ) {
      if (reliaWidgets !== null) reliaWidgets.stop();
    }
    currentSessionStatusRef.current = currentSession.status;
    cameraUrlRef.current = currentSession.cameraUrl;

    setCameraUrl(getCameraURL());
  }, [currentSession]);

  // The receiver is always on the left!
  return (
    <Container className={"laboratory-container text-center"}>
      <Row>
        <Col className={"laboratory-status-message"} md={{ span: 10, offset: 1 }}>
          {t(convertStatusMessage(currentSession.status))}
          {currentSession.status === "completed" && (
            <span>
              &nbsp;
              <button className="btn btn-sm btn-primary" onClick={refreshTask}>
                {t("runner.buttons.refresh")} <i className="bi bi-arrow-clockwise"></i>
              </button>
            </span>
          )}
          <br></br>
          <span>
            {t("runner.assigned-instance")}:{" "}
            <span>
              <tt>{currentSession.assignedInstanceName}</tt>
            </span>
            &nbsp;&nbsp;
            <button className="btn btn-sm btn-primary" onClick={handleCameraButtonClick}>
              {showCamera ? t("runner.buttons.hide") : t("runner.buttons.show")}{" "}
              <i className="bi bi-camera-fill"></i>
            </button>
          </span>
        </Col>
      </Row>
      {showCamera && (
        <Row>
          <Col
            xs={{ span: 12 }}
            md={{ span: 10, offset: 1 }}
            lg={{ span: 8, offset: 2 }}
            xl={{ span: 6, offset: 3 }}
          >
            <img
              id={"camera-image"}
              src={cameraURL}
              onLoad={onImageLoaded}
              onError={onImageLoaded}
              alt="Camera"
              width="100%"
            />
          </Col>
          <center>
            <br />
            <p>
              <i>{t("runner.faraday-info")}</i>
            </p>
          </center>
        </Row>
      )}
      <Row id={"relia-widgets"}>
        <Col
          style={{
            display: currentSession != null ? "block" : "none",
          }}
        >
          <center>
            <h2>{t("runner.receiver")}</h2>
            {currentSession.receiverFilename != null && (
              <h4>({currentSession.receiverFilename})</h4>
            )}
          </center>

          <div id={"relia-widgets-receiver"}></div>
        </Col>
        <Col
          style={{
            display: currentSession.assignedInstance != null ? "block" : "none",
          }}
        >
          <center>
            <h2>{t("runner.transmitter")}</h2>
            {currentSession.transmitterFilename != null && (
              <h4>({currentSession.transmitterFilename})</h4>
            )}
          </center>

          <div id={"relia-widgets-transmitter"}></div>
        </Col>
      </Row>
    </Container>
  );
}

export default withTranslation()(Laboratory);
