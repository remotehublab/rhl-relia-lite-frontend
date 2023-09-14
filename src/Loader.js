/**
  This React component file defines a set of components and functionality for uploading, selecting,
  and sending gnr files to an SDR device. It consists of the following components:

  - `Uploader`: Handles file upload functionality, allowing users to select files for transmission.
  - `Selector`: Displays a list of uploaded files and provides options to select which files are receivers and transmitters.
  - `Sender`: Hosts a button that initiates the process of sending selected files to the SDR device.
  - `Loader`: The top-level component that manages state, interactions between child components, and file upload and transmission logic.

   Todo:
     = Add missing translations



  Known bugs:
   = because we are using an index to set what file is currently selected in our table in the Selector component,
      when we remove an element it messes up with the current indexing and changes which files are selected
 */
import React, { useState } from 'react';

// for  translations
import i18n, {t} from './i18n';
import { withTranslation } from 'react-i18next';

//for design
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import './Loader.css';

/**
 * Uploader Component
 * @param {Array} uploadedFiles - An array of uploaded files.
 * @param {Function} setUploadedFiles - A function to update the uploaded files.
 * @param setTableIsVisible - A  function to update the flag to control table visibility.
 *
 * @returns {JSX.Element} The rendered Uploader component.
 */
function Uploader({ uploadedFiles, setUploadedFiles, setTableIsVisible }) {

  /**
   * handleFileChange function is responsible for updating the selectedFiles state
   * when one or more files are chosen using the file input.
   * It checks if any files are selected, updates the state with the chosen files,
   * and adds them to the uploadedFiles state
   * If no files are selected, it logs a message to indicate that no files were selected.
   * TODO: this function is quite big and its handling both the frontend and backend part of file handling,
   *       it would be best to separate it
   */
  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      const newUploadedFiles = Array.from(event.target.files);
      const formData = new FormData();
      const files = event.target.files;

      // Add each file to the form data.
      for (let i = 0; i < files.length; i++) {
          formData.append('file-' + i  , files[i]);
      }

      // Now, send the formData using Fetch.
      fetch('/files/', {
          method: 'POST',
          body: formData
      })
      .then(response => response.json())
      .then(data => {
        const uniqueNames = new Set();
        const uniqueFiles = [...uploadedFiles, ...newUploadedFiles].filter(file => {
          if (!uniqueNames.has(file.name)) {
              uniqueNames.add(file.name);
              return true; // Include the file in the result
          }
          return false; // Exclude duplicates
        });
        setUploadedFiles(uniqueFiles);
        setTableIsVisible(true);
      })
      .catch(error => {
          console.error('Error uploading files:', error);
      });

    } else {
      // Log a message if no files are selected.
      console.log('No files selected.');
    }
  };

  return (
    <Container>
      <Row>
        <Col md={{span: 6, offset: 3}} className={"form-col"}>
          <Form.Control type="file" accept=".grc" onChange={handleFileChange}  multiple />
        </Col>
      </Row>
    </Container>
  );
}

/**
 * Selector Component
 *
 * @param {Array} uploadedFiles - An array of uploaded files.
 * @param {Function} handleSelect - A function to handle the selection of receivers and transmitters.
 * @param {Function} handleRemove - A function to handle row removal.
 * @param {boolean} tableIsVisible - A flag to control table visibility.
 *
 * @returns {JSX.Element} The rendered Selector component.
 */
function Selector({ uploadedFiles, handleSelect, handleRemove, tableIsVisible }) {
  if (tableIsVisible) {
    return (
        // TODO: add translations to the first row elements
      <Container>
          <Row>
            <Col xs={7} md={5} className={"file-name-col"}>
              File Name
            </Col>
            <Col xs={2} md={3} className={"radio-col"}>
              Tx
            </Col>
            <Col xs={2} md={3} className={"radio-col"}>
              Rx
            </Col>
            <Col xs={1}  className={"remove-col"}>
              Delete
            </Col>
          </Row>
        {uploadedFiles.map((file, index) => (
          <Row key={index}>
            <Col xs={7} md={5} className={"file-col"}>
              <span  className={"file-name-col"}>
                {file.name}
              </span>
            </Col>
            <Col xs={2} md={3} className={"radio-col"}>
              <Form.Check
                name="receiver"
                onChange={() => handleSelect(index, 'TX')}
              />
            </Col>
            <Col xs={2} md={3} className={"radio-col"}>
              <Form.Check
                name="transmitter"
                onChange={() => handleSelect(index, 'RX')}
              />
            </Col>
            <Col xs={1}  className={"remove-col"}>
              <Button variant="danger" size="sm" onClick={() => handleRemove(index)}><i className="bi bi-x-lg"></i></Button>
            </Col>
          </Row>
        ))}
      </Container>
    );
  }
}


/**
 * Sender component that hosts a button that sends the files to Sdr Device
 * @param selectedFilesColumnRX - RX files
 * @param selectedFilesColumnTX - TX files
 * @param {Function} handleSendToSDR      - Function that does the upload process
 * @returns {JSX.Element} - The rendered Sender component.
 */
function Sender({ selectedFilesColumnRX, selectedFilesColumnTX }) {
  const handleSendToSDR = ( ) => {
    console.log("Sending RX files:");
    console.log(selectedFilesColumnRX);

    selectedFilesColumnRX.forEach(function(entry) {
      console.log("Sent " + entry.name);

    });
    console.log("Sending TX files:");
    console.log(selectedFilesColumnRX);

    selectedFilesColumnTX.forEach(function(entry) {
      console.log("Sent " + entry.name);
    });
  }



  if ( selectedFilesColumnTX.length > 0 || selectedFilesColumnRX.length > 0) {
    return (
      <Container className={"sender-container"}>
        <Row>
          <Col md={{span: 6, offset: 3}} className={"loader-col"}>
            <Button className={"loader-button"} onClick={() => handleSendToSDR(selectedFilesColumnRX, selectedFilesColumnTX)}>{t("loader.select.send-to-sdr-devices")}</Button>
          </Col>
        </Row>
      </Container>
    );
  } else {
    return (
      <Container/>
    );
  }
}

/**
 * Loader Component
 *
 * @returns {JSX.Element} The rendered Loader component.
 */
function Loader() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFilesColumnRX, setSelectedFilesColumnRX] = useState([]);
  const [selectedFilesColumnTX, setSelectedFilesColumnTX] = useState([]);
  const [tableIsVisible, setTableIsVisible] = useState(false);

  /**
   * Handle the selection of receivers (RX) and transmitters (TX) for an uploaded file.
   *
   * @param {number} index - The index of the uploaded file in the array.
   * @param {string} column - The column to which the file should be assigned ('RX' or 'TX').
   */
  const handleSelect = (index, column) => {
    if (column === 'RX') {
      if (selectedFilesColumnRX.includes(uploadedFiles[index])) {
        setSelectedFilesColumnRX(selectedFilesColumnRX.filter(item => item !== uploadedFiles[index]));
      } else {
        setSelectedFilesColumnRX([...selectedFilesColumnRX,uploadedFiles[index]]);
      }

    } else if (column === 'TX') {
      if (selectedFilesColumnTX.includes(uploadedFiles[index])) {
        setSelectedFilesColumnTX(selectedFilesColumnTX.filter(item => item !== uploadedFiles[index]))
      } else {
        setSelectedFilesColumnTX([...selectedFilesColumnTX,uploadedFiles[index]]);
      }
    }
  };

  const handleRemove = (indexToRemove) => {
    fetch('/files/' + uploadedFiles[indexToRemove].name, {
        method: 'DELETE'
    })
    .then((response) => {
        if (response.status === 200) {
            return response.json();
        }
    })
    .then((data) => {
        // Update the userData state with the retrieved data
        if(data.success) {
          console.log("removed file from server");
        } else {
          console.log("failed to remove file");
        }
    });
    setSelectedFilesColumnRX(selectedFilesColumnRX.filter(item => item !== uploadedFiles[indexToRemove]))
    setSelectedFilesColumnTX(selectedFilesColumnTX.filter(item => item !== uploadedFiles[indexToRemove]))
    setUploadedFiles(uploadedFiles.filter((file, index) => index !== indexToRemove));

    // make call to delete file




  };

  return (
      <Container>
        <Col md={{span: 8, offset: 2}}>
          <Row>
            <Col>
              <Uploader uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} tableIsVisible={tableIsVisible} setTableIsVisible={setTableIsVisible}/>
            </Col>
          </Row>
          <Row>
            <Col>
              <Selector uploadedFiles={uploadedFiles} handleSelect={handleSelect} handleRemove={handleRemove} tableIsVisible={tableIsVisible} />
            </Col>
          </Row>
          <Row>
            <Col>
              <Sender selectedFilesColumnTX={selectedFilesColumnTX} selectedFilesColumnRX={selectedFilesColumnRX} />
            </Col>
          </Row>
        </Col>
      </Container>
  );
}


export default withTranslation()(Loader);