/**
  Inner component for the relia webapp, part of the Configuration tab
   defines a set of configurations for the experiment.
   Todo:
     Add missing translations
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

import './Configuration.css';

/**
 * Configuration Component
 * @param {Object} currentSession - Holds the data for the current user session
 * @param {Function} setCurrentSession - Function to set the current user session.
 * @param {Function} setSelectedTab - Function to set the selected tab (intro/files/lab).
 * @param {Object} selectedConfiguration - Object holding the current state of the selected configuration
 * @param {Function} setSelectedConfiguration - Function to set the selected configuration
 * @param {Function} loadConfiguration - Function to load the selected configuration in the laboratory lite tab
 * 
 * @returns {JSX.Element} The rendered Loader component.
 */
function Configuration({
    currentSession,
    setCurrentSession,
    setSelectedTab,
    selectedConfiguration,
    setSelectedConfiguration,
    loadConfiguration
}) {

    const [configuration, setConfiguration] = useState({});

    useEffect(() => {
        async function fetchConfiguration() {
            try {
                const response = await fetch(`${process.env.REACT_APP_RECORDINGS_BASE_URL}configuration.json`);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Network response was not ok. Status: ${response.status}. Response: ${errorText}`);
                }
                const data = await response.json();
                setSelectedConfiguration(getEmptyParameters(data));
                setConfiguration(data);
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            }
        }
        
        fetchConfiguration();
    }, []);

    const select = (column, option) => {
        setSelectedConfiguration((prev) => ({ ...prev, [column]: option }));
    };

    const allSelected = Object.values(selectedConfiguration).every(option => option !== null);

    const generateOptionsButtons = () => {
        if (!configuration || !configuration.parameters) return null;  // Render nothing if no configuration data
        return configuration.parameters.map((parameter, parameterIndex) => (
            <Col key={parameterIndex}>
                <Col className="radio-buttons">
                    <p><b>{t("loader.configuration." + parameter.name)}</b></p>
                    {parameter.values.map((option, optionIndex) => (
                        <label key={optionIndex}>
                            <input
                                type="radio"
                                name={parameter.name}
                                value={option}
                                checked={selectedConfiguration[parameter.name] === option}
                                onChange={() => select(parameter.name, option)}
                            />
                            {t("loader.configuration." + option).replace("loader.configuration.", "")}
                        </label>
                    ))}
                </Col>
            </Col>
        ));
    };

    return (
        <Container style={{ margin: '10px' }}>
            <Col md={{ span: 8, offset: 2 }}>
                <Row>
                    {generateOptionsButtons()}
                </Row>
                {/* Continue Button */}
                <Row className="justify-content-center">
                    <Col xs="auto">
                        <button className={"loader-button btn btn-primary"} onClick={() => loadConfiguration()} 
                            disabled={!allSelected}>
                            {t("loader.configuration.load-configuration")}
                        </button>
                    </Col>
                </Row>
            </Col>
        </Container>
    );
}

/**
 * Function to get a map of configuration parameter names that each point to null
 * @param {Object} configuration - The JSON object representing the configuration options
 * 
 * @returns {Object} Map of (parameterName: null) for each parameter within given configuration
 * **/
function getEmptyParameters(configuration) {
    const selections = {}
    try {
        if (configuration != null) {
            for (const parameter of configuration.parameters) {
                selections[parameter.name] = null;
            }
        }
    } catch {
        console.log("Invalid configuration format");
    }
    
    return selections;
}

export default withTranslation()(Configuration);