function map(
    val: number,
    originMin: number,
    originMax: number,
    targetMin: number,
    targetMax: number
) {
    return (
        ((val - originMin) * (targetMax - targetMin)) /
            (originMax - originMin) +
        targetMin
    );
}

export default function AnimatedLoadingCircle({
    percentage,
    className,
    thikness = 4,
}: {
    percentage: number;
    thikness?: number;
    className?: string;
}) {
    const dashOffset = map(percentage, 0, 100, 251.3272, 0);
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className={className}
        >
            <circle
                fill="transparent"
                cx="50"
                cy="50"
                r="40"
                strokeWidth={thikness}
                strokeDasharray="251.3272"
                strokeDashoffset="0"
                className="stroke-white/40 z-10"
            ></circle>
            <circle
                fill="transparent"
                cx="50"
                cy="50"
                r="40"
                strokeWidth={thikness}
                strokeDasharray="251.3272"
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="stroke-white z-20 transition-all"
            ></circle>
        </svg>
    );
}
