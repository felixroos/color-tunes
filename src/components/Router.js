import React from "react";
import Songs from '../Songs'
import Explorer from '../Explorer'

export default ({ route }) => {

    switch (route.path) {
        case "songs":
            return <Songs />;
        default:
            return <Explorer />;
    }
};
