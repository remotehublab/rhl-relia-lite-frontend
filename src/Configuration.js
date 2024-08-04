/**
  Inner component for the relia webapp, part of the Configuration tab
   defines a set of configurations for the experiment.
   Todo:
     = Add missing translations
 */

// react stuff
import React, {
    useEffect,
    useState
} from 'react';

// for  translations
import i18n, {
    t
} from './i18n';
import {
    withTranslation
} from 'react-i18next';

//for design
import {
    Container,
    Row,
    Col,
    Button,
    Form
} from 'react-bootstrap';
import configuration from './recordings/configuration.json'
import './Configuration.css';

export const numOptions = getNumOptions();  // The number of confiugration options
export const emptyOptions = getEmptyOptions(); // {Option1: null, ... , OptionnumOptions: null}

/**
 * Configuration Component
 * @param {Object} currentSession - Holds the data for the current user session
 * @param {Function} setCurrentSession - Function to set the current user session.
 * @param {Function} setSelectedTab - Function to set the selected tab (intro/files/lab).
 * @param {Function} setConfiguration - Function to set the selected configuration
 * @param {Object} selectedConfiguration - Object holding the current state of the configuration
 * 
 * @returns {JSX.Element} The rendered Loader component.
 */
function Configuration({
    currentSession,
    setCurrentSession,
    setSelectedTab,
    setConfiguration,
    selectedConfiguration
}) {

    const selectOption = (column, option) => {
        setConfiguration((prev) => ({ ...prev, [column]: option }));
    };

    const generateOptionsButtons = () => {
        return Object.keys(configuration).map((parameter, index) => (
            <Col key={index}>
                <Col className="radio-buttons">
                    <p><b>{configuration[parameter].name}</b></p>
                    {configuration[parameter].values.map((option, optionIndex) => (
                        <label key={optionIndex}>
                            <input
                                type="radio"
                                name={configuration[parameter].name}
                                value={option}
                                checked={selectedConfiguration[configuration[parameter].name] === option}
                                onChange={() => selectOption(configuration[parameter].name, option)}
                            />
                            {option}
                        </label>
                    ))}
                </Col>
            </Col>
        ));
    };

    const allSelected = Object.values(selectedConfiguration).every(option => option !== null);

    const continueToNextPage = () => {
        if (allSelected) {
            window.location.href = 'nextpage.html'; // Change this to the URL of your next page
        }
    };

    return (
        <Container>
            <Col md={{ span: 8, offset: 2 }}>
                <Row>
                    {generateOptionsButtons()}
                </Row>
                {/* Continue Button */}
                <button onClick={continueToNextPage} disabled={!allSelected}>Launch Experiment</button>
            </Col>
        </Container>
    );
}

function getNumOptions() {
    return Object.keys(configuration).length;
}

function getEmptyOptions() {
    const selections = {}
    for (const option of Object.keys(configuration)) {
        const name = configuration[option].name;
        selections[name] = null;
    }
    return selections;
}

export default withTranslation()(Configuration);