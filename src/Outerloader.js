/**
  This code works as an outer layer for the Relia frontend page,
  enabling users to switch from the different segments of the lab
*/
import React, { useEffect, useState } from "react";

// for  translations
import i18n, { t } from "./i18n";
import { withTranslation } from "react-i18next";

//for design
import { Container, Row, Col, Button, Image, Nav } from "react-bootstrap";
import "./Loader.css";

import Configuration from "./Configuration";
import LaboratoryLite from "./LaboratoryLite";
import Introduction from "./Introduction";

// old tabs
import Loader from "./Loader";
import Laboratory from "./Laboratory";

//images
import LabsLand_logo from "./components/images/LabsLand-logo.png";
import UW_logo from "./components/images/uw-logo.gif";
import RHL_logo from "./components/images/RHL-logo.png";
import { select } from "react-i18next/icu.macro";

/**
 * Renders the Outerloader component.
 *
 *   The {@code Outerloader} component acts as the main interface for the Relia educational lab environment.
 *   It offers navigational controls to switch between various segments of the lab such as Introduction, Configuration,
 *   and Laboratory. This component is responsible for managing user sessions, handling experiment configurations,
 *   and rendering content dynamically based on the user's interaction and current state.
 *
 * State:
 *  selectedTab: currently selected tab of the lab
 * @returns {JSX.Element} The rendered Outerloader component.
 */
function Outerloader() {
  const [selectedTab, setSelectedTab] = useState("introduction");

  const [userData, setUserData] = useState({
    locale: "en",
    redirect_to: "",
    session_id: null,
    success: null,
    user_id: null,
  });

  const [reliaWidgets, setReliaWidgets] = useState(null);

  const [storedFiles, setStoredFiles] = useState([]);

  const [currentSession, setCurrentSession] = useState({
    taskIdentifier: null,
    status: "not_started",
    message: "",
    assignedInstance: null,
    assignedInstanceName: "",
    dataUrl: null,
    cameraUrl: null,
    renderingWidgets: false,
  });

  // Initializes an object [1: null, 2: null, ... , numOptions: null] to store configuration
  // null signifies no option is selected
  //const [selectedConfiguration, setConfiguration] = useState(emptyOptions);
  const [selectedConfiguration, setSelectedConfiguration] = useState({});

  const [fileStatus, setFileStatus] = useState(
    <a href="https://rhlab.ece.uw.edu/projects/relia/" target="_blank" rel="noopener noreferrer">
      Upload GNU radio files to proceed TEST
    </a>
  );

  // Set a global variable for the base API URL.
  window.API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api/`;

  // Using useEffect to execute code after the component mounts.
  useEffect(() => {
    // Accessing the document's head element.
    const head = document.head;

    // Check if the Google Charts script is already loaded.
    let script = document.getElementById("googleChartsScript");
    if (!script) {
      // If the script isn't loaded, create a new script element.
      script = document.createElement("script");
      // Set the source of the script to load Google Charts.
      script.src = "https://www.gstatic.com/charts/loader.js";
      // Assign an ID to the script for future reference.
      script.id = "googleChartsScript";

      // Define what happens once the script is loaded.
      script.onload = () => {
        // Check if the Google Charts library is available.
        if (window.google && window.google.charts) {
          // Load the 'corechart' package from Google Charts.
          window.google.charts.load("current", { packages: ["corechart"] });
        }
      };

      // Append the script element to the document's head.
      head.appendChild(script);
      // console.log(process.env.REACT_APP_API_BASE_URL);
    }
  }, []); // The empty dependency array ensures this effect runs once after initial render.

  // Define a useEffect hook to make the fetch call when the component mounts
  useEffect(() => {
    getUserData();
    // Run for now every 5 minutes
    const intervalId = setInterval(getUserData, 5 * 60 * 1000);
    // could add clean up function to clear timer if we ever want to stop it
  }, []);

  useEffect(() => {
    if (
      (selectedTab === "introduction" || selectedTab === "configuration") &&
      // skip completed
      (currentSession.status === "queued" ||
        //  skip deleted
        currentSession.status === "receiver-assigned" ||
        currentSession.status === "fully-assigned" ||
        currentSession.status === "receiver-still-processing" ||
        currentSession.status === "transmitter-still-processing")
    ) {
      cancelTask();
      if (reliaWidgets != null) {
        reliaWidgets.stop();
      }
    }
  }, [selectedTab]);

  /**
   * Renders the appropriate content based on the current tab selection.
   *
   * This function determines which component to display in the UI based on the current value
   * of the 'selectedTab' state.
   *
   * @returns {JSX.Element | null} - The content to be rendered for the selected tab. Returns a JSX
   *                                 Element corresponding to the selected tab ('introduction',
   *                                 'configuration', or 'laboratory-lite'). Returns null if no tab matches.
   */
  const renderContent = () => {
    switch (selectedTab) {
      // RELIA LITE Tabs
      case "introduction":
        return (
          <Introduction currentSession={currentSession} setCurrentSession={setCurrentSession} />
        );
      case "configuration":
        return (
          <Configuration
            currentSession={currentSession}
            setCurrentSession={setCurrentSession}
            setSelectedTab={setSelectedTab}
            setSelectedConfiguration={setSelectedConfiguration}
            selectedConfiguration={selectedConfiguration}
            loadConfiguration={loadConfiguration}
          />
        );
      case "laboratory-lite":
        return (
          <LaboratoryLite
            currentSession={currentSession}
            setCurrentSession={setCurrentSession}
            setReliaWidgets={setReliaWidgets}
            reliaWidgets={reliaWidgets}
            fileStatus={fileStatus}
            setFileStatus={setFileStatus}
            checkStatus={checkStatus}
            manageTask={manageTask}
          />
        );

      // RELIA Tabs
      // case 'load-files':
      //     return <Loader currentSession={currentSession} setCurrentSession={setCurrentSession} setSelectedTab={setSelectedTab}
      //                    storedFiles={storedFiles} setStoredFiles={setStoredFiles} setSelectedFilesColumnRX={setSelectedFilesColumnRX}
      //                     selectedFilesColumnRX={selectedFilesColumnRX} selectedFilesColumnTX={selectedFilesColumnTX} setSelectedFilesColumnTX={setSelectedFilesColumnTX}
      //                      fileStatus={fileStatus} setFileStatus={setFileStatus} checkStatus={checkStatus} manageTask={manageTask}/> ;
      // case 'laboratory':
      //     return <Laboratory currentSession={currentSession} setCurrentSession={setCurrentSession} setReliaWidgets={setReliaWidgets} reliaWidgets={reliaWidgets}
      //                         fileStatus={fileStatus} setFileStatus={setFileStatus} checkStatus={checkStatus} manageTask={manageTask}/> ;
      default:
        return null;
    }
  };

  /**
   * Fetches and updates user-specific data and stored files information.
   *
   * This function performs two primary tasks:
   * 1. It makes an HTTP GET request to the '/user/poll' endpoint to retrieve current user data,
   *    such as locale, redirection URL, session ID, and user ID. This data is then used to update
   *    the component's state.
   * 2. It makes a second GET request to the '/files/' endpoint to fetch a list of files stored
   *    for the current user session. It updates the component's state with the list of files,
   *    and extracts receiver and transmitter-specific files to manage their respective states.
   */
  const getUserData = () => {
    console.log("CALLED getUserData");
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user/poll`, {
      method: "GET",
    })
      .then((response) => {
        console.log("response:", response);
        if (response.ok) {
          // Check if response is ok
          return response.json();
        } else {
          throw new Error("Network response was not ok.");
        }
      })
      // bug here possibly if data is not returned correctly
      .then((data) => {
        console.log("Data:", data);
        if (!data.success) {
          if (data.redirect_to) window.location.href = data.redirect_to;
          else window.location.href = "https://relia.rhlab.ece.uw.edu";
        }

        if (data.locale && data.locale !== i18n.language) {
          i18n.changeLanguage(data.locale);
        }

        // Update the userData state with the retrieved data
        setUserData(data);
      })
      .catch((error) => {
        console.error("Fetch error:", error.message);
      });

    // fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user/files/`, {
    //     method: 'GET',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     }
    // })
    // .then(response => {
    //     if (response.ok) {
    //         return response.json();
    //     } else {
    //         throw new Error('Network response was not ok.');
    //     }
    // })
    // .then(data => {
    //     if (data.success) {
    //         // Access the list of files from the response
    //         const files = data.files;
    //         setStoredFiles(files);
    //         const selectedRXFiles = data.metadata['receiver'];
    //         setSelectedFilesColumnRX(selectedRXFiles);
    //         const selectedTXFiles = data.metadata['transmitter'];
    //         setSelectedFilesColumnTX(selectedTXFiles);
    //     } else {
    //         console.error('Error fetching files:', data.message);
    //     }
    // })
    // .catch(error => {
    //     console.error('Error:', error.message);
    // });
  };

  /**
   * Cancels the current lab task based on the task identifier.
   *
   * This function is responsible for sending a POST request to the '/scheduler/user/tasks/{taskIdentifier}'
   * endpoint with the action 'delete' to cancel the task that is currently associated with the user's session.
   * It is typically invoked when a change in the user's interaction flow necessitates the cancellation of
   * an ongoing or queued task in the lab environment.
   *
   * After the cancellation request is successfully processed, the function retrieves updated user data
   * and potentially updates the UI or internal state to reflect the cancellation.
   *
   */
  const cancelTask = () => {
    const jsonData = {
      action: "delete",
    };

    fetch(
      `${process.env.REACT_APP_API_BASE_URL}/scheduler/user/tasks/${currentSession.taskIdentifier}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Task cancellation successful", data);
        getUserData();
        // Additional logic here if needed, e.g., updating state or UI
      })
      .catch((error) => {
        console.error("Error canceling task", error);
      });
  };

  /**
   * Initiates a new task for processing and switches the user to the "Laboratory" tab.
   *
   * This function is responsible for starting a new processing task with the server.
   * the task's details are updated in the current session,
   * and the user interface is redirected to the "Laboratory" tab where the task progress
   * can be monitored. This function is an essential part of the workflow in the SDR (Software Defined Radio)
   * operation setup, where it marks the transition from file selection and setup to the actual
   * processing and observation phase in the "Laboratory" tab.
   *
   * On a successful server response, the current session state is updated with the new task's
   * identifier, status, and message. This function also initiates a status check loop by calling
   * `checkStatus` function, which repeatedly checks the status of the newly created task.
   *
   * Usage:
   * This function is typically called when a user has finished setting up files for transmission
   * and reception and is ready to start the processing task. It represents a key action in the
   * workflow of submitting and monitoring tasks in the application.
   *
   */
  const manageTask = () => {
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
            // "taskIdentifier": data.taskIdentifier,
            status: data.status,
            message: data.message,
            // "assignedInstance": null,
            // "assignedInstanceName": t("runner.no-instance-yet"),
            configurationFilename: null,
            dataUrl: null,
            cameraUrl: null,
            renderingWidgets: currentSession.renderingWidgets,
          };
          setCurrentSession(newSession);
          Object.assign(currentSession, newSession);
          console.log(currentSession);
          setTimeout(checkStatus, 1000);
          setSelectedTab("laboratory");
        } else {
          if (setFileStatus) {
            setFileStatus(<a>Error sending files, please try again</a>);
          }
          console.error("Failed to create task");
        }
      });
  };

  /**
   * Initiates a new task for processing and switches the user to the "Laboratory" tab.
   *
   * This function is responsible for updating the current session's configuratin folder, data URL, and video URL
   * so these can be used to get the necessary information in the Laboratory tab / Laboratory Lite component.
   * The task's details are updated in the current session,
   * and the user interface is redirected to the "Laboratory" tab (Laboratory Lite).
   * This function is an essential part of the workflow in the SDR (Software Defined Radio)
   * operation setup, where it marks the transition from configuration selection to the actual
   * processing and observation phase in the "Laboratory" tab.
   *
   * On a successful server response, the current session state is updated with the new task's
   * identifier, status, and message. This function also initiates a status check loop by calling
   * `checkStatus` function, which repeatedly checks the status of the newly created task.
   *
   * Usage:
   * This function is typically called when a user has finished selecting the configuration
   * and is ready to start the processing task. It represents a key action in the
   * workflow of submitting and monitoring tasks in the application.
   *
   */
  const loadConfiguration = () => {
    // Create file name based on selected configuration
    console.log("LOADING CONFIGURATION");
    var configurationFoldername = "";
    for (const parameter of Object.keys(selectedConfiguration)) {
      configurationFoldername += parameter + "_" + selectedConfiguration[parameter] + "_";
    }
    configurationFoldername = configurationFoldername.substring(
      0,
      configurationFoldername.length - 1
    );
    console.log("configuration file name: ", configurationFoldername);
    // Fetch the file
    fetch(`${process.env.REACT_APP_RECORDINGS_BASE_URL + configurationFoldername}/index.json`)
      .then((response) => {
        console.log("configuration file response: ", response);
        if (response.status === 200) {
          return response.json();
        } else {
          // TODO
          console.log("Failed to fetch: Status " + response.status);
          setFileStatus(<a>Error receiving files, please try again</a>);
        }
      })
      .then((data) => {
        console.log("configuration file json: ", data);
        if (data && data.recordings) {
          const URLs = getURLs(data.recordings);
          const newSession = {
            // "taskIdentifier": null, //data.taskIdentifier,
            status: data.status, //data.status,
            message: null, //data.message,
            // "assignedInstance": null,
            // "assignedInstanceName": t("runner.no-instance-yet"),
            configurationFoldername: configurationFoldername,
            dataUrl: URLs["dataUrl"],
            cameraUrl: URLs["videoUrl"],
            renderingWidgets: currentSession.renderingWidgets,
          };
          setCurrentSession(newSession);
          Object.assign(currentSession, newSession);
          console.log(currentSession);
          setSelectedTab("laboratory-lite");
        } else {
          if (setFileStatus) {
            setFileStatus(<a>Error sending files, please try again</a>);
          }
          console.error("Failed to create task");
        }
      })
      .catch((error) => {
        console.error("There was an error with the fetch operation:", error);
        if (setFileStatus) {
          setFileStatus(<a>Unexpected error occurred, please try again</a>);
        }
      });
  };

  /**
   * Given a recordings JSON array from the index file of a configuration folder,
   * finds a random recording and returns a map of the data URL (map['dataUrl'])
   * and video URL (map['videoUrl']).
   * **/
  function getURLs(recordings) {
    const URLs = {};
    const randomIndex = Math.floor(Math.random() * recordings.length);
    const randomRecording = recordings[randomIndex];
    URLs["dataUrl"] = randomRecording.dataUrl;
    URLs["videoUrl"] = null;
    // TODO: add functionality to choose the correct type of video URL
    const requiredVideoURLType = "video/mp4";
    for (const videoFormat of randomRecording.videoUrl) {
      if (videoFormat.type === requiredVideoURLType) {
        URLs["videoUrl"] = videoFormat.src;
      }
    }
    return URLs;
  }

  /**
   * Periodically checks the status of the current user task on the server.
   *
   * This function makes GET requests to the server to retrieve the current status of a task
   * identified by `currentSession.taskIdentifier`. It updates the `currentSession` state with
   * the new status, message, and any additional data received from the server.
   *
   * If the task status is one of the intermediate states (like "queued", "receiver-assigned",
   * "fully-assigned", etc.), the function sets a timeout to call itself again, effectively
   * creating a polling mechanism to regularly check for updates until the task reaches a
   * final state (like "completed" or "deleted").
   *
   * @requires currentSession - The current user session object, which contains the taskIdentifier.
   * @modifies currentSession - Updates the currentSession state with the latest task status and message.
   *
   * Usage:
   * This function is used to continuously monitor the progress of a task related to SDR (Software Defined Radio) operations.
   * It is important for keeping the user interface in sync with the task's progress on the server.
   */
  const checkStatus = () => {
    fetch(
      `${process.env.REACT_APP_API_BASE_URL}/scheduler/user/tasks/${currentSession.taskIdentifier}`,
      {
        method: "GET",
      }
    )
      .then((response) => {
        console.log("Response:", response);
        if (response.status === 200) {
          return response.json();
        }
      })
      .then((data) => {
        console.log("DATA:");
        console.log(data);
        if (data.success) {
          const newSession = {
            // "taskIdentifier": currentSession.taskIdentifier,
            status: data.status,
            message: data.message,
            // "assignedInstance": data.assignedInstance,
            // "assignedInstanceName": data.assignedInstance,
            configurationFilename: null,
            dataUrl: null,
            cameraUrl: data.cameraUrl,
            renderingWidgets: currentSession.renderingWidgets,
          };
          setCurrentSession(newSession);
          Object.assign(currentSession, newSession);
          console.log("checked status " + currentSession);
          if (
            // skip completed
            data.status === "queued" ||
            //  skip deleted
            data.status === "receiver-assigned" ||
            data.status === "fully-assigned" ||
            data.status === "receiver-still-processing" ||
            data.status === "transmitter-still-processing" ||
            data.status === "receiver-assigned"
          ) {
            setTimeout(checkStatus, 1000);
          }
        } else {
          console.error("Failed to check status:", data.message);
        }
      });
  };
  /**
   * Fetches and displays the library of files for the user.
   *
   * This function makes an HTTP GET request to the '/files/' endpoint to retrieve a list of files
   * available in the user's library. Upon a successful response, it processes the data to extract
   * and log the files, along with metadata related to 'receiver' and 'transmitter'.
   *
   * Note: This function is primarily used for debugging.
   */

  const showLibrary = () => {
    // Make a GET request to '/files/' to fetch the list of files
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user/files/`, {
      method: "GET",
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
      })
      .then((data) => {
        if (data.success) {
          const { files, metadata } = data;
          console.log(files);
          console.log(metadata);
          console.log("Current receiver:", metadata["receiver"]);

          // Show files from metadata['transmitter']
          console.log("Current trasmitter:", metadata["transmitter"]);

          // Print every file in the files array
          files.forEach((file) => {
            console.log("File:", file);
          });
        } else {
          console.error("Failed to fetch files:", data.message);
        }
      });
  };

  return (
    <Container>
      <Container className={"outer-container"}>
        <Row className={"images-container"}>
          <Col className={"image-col"}>
            <a className={"image-col"} href={"https://ece.uw.edu"} target="_blank">
              <Image src={UW_logo} fluid className={"image"} />
            </a>
          </Col>
          <Col className={"image-col"}>
            <a className={"image-col"} href={"https://rhlab.ece.uw.edu"} target="_blank">
              <Image src={RHL_logo} fluid className={"image"} />
            </a>
          </Col>
          <Col className={"image-col"}>
            <a className={"image-col"} href={"https://labsland.com"} target="_blank">
              <Image src={LabsLand_logo} fluid className={"image"} />
            </a>
          </Col>
        </Row>
        <Row>
          <Col className={"button-container"}>
            <a className={"btn btn-primary"} href={userData.redirect_to}>
              <i className="bi bi-arrow-left"></i>&nbsp;{t("loader.upload.go-back")}
            </a>
          </Col>
          <Col className={"header-container"}>
            <h1 className={"relia-title"}>SDR Lab (RELIA) - {process.env.REACT_APP_DEVICE_NAME}</h1>
          </Col>
          <Col className={"button-container"}>
            {/*<a onClick={() => showLibrary()} className={"btn btn-primary"}>Show Library</a>*/}
          </Col>
        </Row>
        <Row>
          <Col className={"pills-container"} md={{ span: 6, offset: 3 }}>
            <Nav variant="pills" defaultActiveKey="introduction" activeKey={selectedTab}>
              <Nav.Item>
                <Nav.Link
                  eventKey="introduction"
                  onClick={() => setSelectedTab("introduction")}
                  className={"pill"}
                >
                  1. {t("loader.upload.introduction")}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  eventKey="configuration"
                  onClick={() => setSelectedTab("configuration")}
                  className={"pill"}
                >
                  2. {t("loader.upload.configuration")}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                {/* Laboratory (lite) tab is disabled and cannot be clicked. It can only be activated programmatically */}
                <Nav.Link eventKey="laboratory" disabled className={"pill"}>
                  3. {t("loader.upload.laboratory")}
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          <Col></Col>
        </Row>
        <Row>
          <Col>{renderContent()}</Col>
        </Row>
      </Container>
    </Container>
  );
}
export default withTranslation()(Outerloader);
