import clsx from "clsx";
import Link from "next/link";

const baseStyles = {
	solid:
		"group inline-flex items-center justify-center rounded-full py-2 px-4 text-sm font-medium focus:outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2",
	outline:
		"group inline-flex ring-1 items-center justify-center rounded-full py-2 px-4 text-sm font-medium focus:outline-hidden",
};

const variantStyles = {
	solid: {
		slate:
			"bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-900 active:text-slate-100 focus-visible:outline-slate-900",
		green:
			"bg-green-500 text-white hover:bg-green-600 active:bg-green-700 active:text-white focus-visible:outline-green-600",
		white:
			"bg-white text-slate-900 hover:bg-gray-100 active:bg-white/90 active:text-slate-900 focus-visible:outline-white",
	},
	outline: {
		slate:
			"ring-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white active:bg-slate-800 active:text-white focus-visible:outline-slate-900",
		white:
			"ring-white text-white hover:bg-white/10 active:bg-white/20 active:text-white focus-visible:outline-white",
	},
};

type ButtonProps = (
	| {
			variant?: "solid";
			color?: keyof typeof variantStyles.solid;
	  }
	| {
			variant: "outline";
			color?: keyof typeof variantStyles.outline;
	  }
) &
	(
		| Omit<React.ComponentPropsWithoutRef<typeof Link>, "color">
		| (Omit<React.ComponentPropsWithoutRef<"button">, "color"> & {
				href?: undefined;
		  })
	);

export function Button({ className, ...props }: ButtonProps) {
	props.variant ??= "solid";
	props.color ??= "slate";

	className = clsx(
		baseStyles[props.variant],
		props.variant === "outline"
			? variantStyles.outline[props.color]
			: props.variant === "solid"
				? variantStyles.solid[props.color]
				: undefined,
		className,
	);

	return typeof props.href === "undefined" ? (
		<button className={className} {...props} />
	) : (
		<Link className={className} {...props} />
	);
}
