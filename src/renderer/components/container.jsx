import React from "react";
import PropTypes from "prop-types";

export default function Container({ children }) {
	return (
		<div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6">
			{children}
		</div>
	);
}

Container.propTypes = {
	children: PropTypes.node.isRequired,
};
