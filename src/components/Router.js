import React from "react";
import Tunes from '../Tunes'
import Explorer from '../Explorer'

export default ({ route }) => {

    switch (route.path) {
        case "explorer":
            return <Explorer />;
        default:
            return <Tunes />;
    }
};
