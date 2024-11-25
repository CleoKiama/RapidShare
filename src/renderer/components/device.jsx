import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";

function Device({ userName, handleClick, address, platform }) {
	return (
		<div
			onClick={() => handleClick(address)}
			className={clsx(
				"flex flex-row items-center cursor-pointer hover:bg-blue-300 rounded-lg hover:py-2 hover:px-3 w-11/12 hover:text-white",
			)}
		>
			<img
				src={`static://assets/${platform}_logo.svg`}
				className="h-10 w-10"
				alt={`${platform} platform logo`}
			/>
			<p className="ml-4 ">{userName}</p>
		</div>
	);
}

Device.propTypes = {
	userName: PropTypes.string.isRequired,
	platform: PropTypes.string.isRequired,
	address: PropTypes.string.isRequired,
	handleClick: PropTypes.func.isRequired,
};

export default Device;
