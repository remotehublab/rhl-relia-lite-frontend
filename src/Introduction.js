import React from 'react';

// for  translations
import i18n, {t} from './i18n';
import { withTranslation } from 'react-i18next';

import { Container, Col } from 'react-bootstrap';

/**
 * Renders the Introduction component.
 *
 * This component displays introductory text that explain how to use the lab
 * Currently placeholder
 *
 * @returns {JSX.Element} The rendered Introduction component.
 */
function Introduction() {
    // TODO: fill this document, discuss it with
    // https://docs.google.com/presentation/d/1LkXYqcaKgF1N0DhtzHHImhMU4-TM61e7jvPDsA2jbY4/edit#slide=id.g29df1718c1d_0_4
    return (
        <Container className={"introduction-container"}>
            <Col md={{span: 10, offset: 1}}>
            <p>Welcome to RELIA, the Software-defined Radio (SDR) remote laboratory.</p>
            <p>The steps to use the remote laboratory are:</p>
            <ol>
                <li>In the Configuration tab you will select the settings you wish to use for the remote experiment. This includes the frequency, target's level of velocity, bandwidth, and a togglable low pass filter.</li>
                <li>Once the configuration is selected, click the Launch Experiment button. This is will update the which experiment is currently underway in the Laboratory tab.</li>
                <li>Then in the Laboratory tab you will see your experiment running for a few seconds. You will see the results in the widgets.</li>
            </ol>
            <p>This work was supported by the National Science Foundation's Division of Undergraduate Education under Grant #2141798. All the source code is open-source and can be found <a href="https://github.com/remotehublab" target="_blank">in GitHub</a>.</p>
            </Col>
        </Container>
    );
}

export default withTranslation()(Introduction);
