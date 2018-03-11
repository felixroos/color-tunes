import React from "react";
import { routeToHash as to } from "../router";


const Navigation = ({ route }) => (
    <div className="Navigation">
        {/* <a href="#/">Tonal</a> */}
        <a href={to("songs")}>Tunes</a>
        <a href={to("explorer")}>Explorer</a>
    </div>
);


export default ({ route, onTonicChange }) => (
    <div className="Header row">
        <div className="column column-100">
            <Navigation route={route} />
        </div>
    </div>
);
