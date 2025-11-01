import type React from "react";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { classNames } from "../css";

interface AlertProps {
	type: "danger" | "info" | "success" | "warning";
	title: string;
	children?: ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
	type,
	title,
	children,
}: AlertProps) => {
	const alertClasses = useMemo(() => {
		return classNames(
			"rounded-md p-4 mb-4",
			type === "danger"
				? "bg-red-50 text-red-800"
				: type === "info"
					? "bg-blue-50 text-blue-800"
					: type === "success"
						? "bg-green-50 text-green-800"
						: type === "warning"
							? "bg-yellow-50 text-yellow-800"
							: "",
		);
	}, [type]);

	return (
		<div className={alertClasses}>
			<h3 className="text-sm font-medium">{title}</h3>
			{children}
		</div>
	);
};
