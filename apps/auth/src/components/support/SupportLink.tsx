import React from "react";
import { classNames } from "../css";
import { t } from "@matsilva/xtranslate";

interface SupportLinkProps {
	href?: string;
	classes?: string;
}

export const SupportLink: React.FC<SupportLinkProps> = ({
	href = "mailto:mat@silvabyte.com",
	classes = "",
}) => {
	const cx = classNames("text-sm font-semibold text-gray-900", classes);
	return (
		<a href={href} className={cx}>
			{t("common.support.contact")} <span aria-hidden="true">&rarr;</span>
		</a>
	);
};
