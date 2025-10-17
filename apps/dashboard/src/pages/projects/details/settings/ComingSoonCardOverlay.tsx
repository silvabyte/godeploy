import { t } from "@matsilva/xtranslate";

export const ComingSoonCardOverlay = ({ show }: { show: boolean }) => {
	if (!show) {
		return null;
	}
	return (
		<div className="absolute bg-white/85 flex w-full h-full justify-center items-center">
			<h3 className="text-base font-semibold leading-6 text-slate-900">
				{t("coming_soon.title")}..
			</h3>
		</div>
	);
};
