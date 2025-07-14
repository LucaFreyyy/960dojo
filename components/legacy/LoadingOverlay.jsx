export default function LoadingOverlay() {
    return (
        <div id="fullScreenLoadingOverlay" style={{ display: 'none' }}>
            <div className="loader">
                <svg width="60" height="60" viewBox="0 0 50 50">
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray="31.4 31.4"
                        transform="rotate(-90 25 25)"
                    >
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0 25 25"
                            to="360 25 25"
                            dur="1s"
                            repeatCount="indefinite"
                        />
                    </circle>
                </svg>
            </div>
            Loading, please wait...
        </div>
    );
}
