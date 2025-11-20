import React, { useState, useEffect } from "react";
import logo from '/roriri.png';

const Loader = ({
    isVisible = true,
    onComplete = null,
    duration = 1500, // Reduced from 3000 to 1500ms (1.5 seconds)
    showProgress = false,
    loadingTexts = ["Loading..."],
    showPercentage = false
}) => {
    const [progress, setProgress] = useState(0);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [fadeClass, setFadeClass] = useState("opacity-100");

    useEffect(() => {
        if (!isVisible) return;

        let interval;

        // Only run progress tracking if duration is provided
        if (duration) {
            interval = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev + (100 / (duration / 30)); // Faster update interval (30ms)
                    if (newProgress >= 100) {
                        clearInterval(interval);
                        setTimeout(() => {
                            setFadeClass("opacity-0");
                            setTimeout(() => onComplete && onComplete(), 300); // Reduced fade time
                        }, 100); // Reduced delay
                        return 100;
                    }
                    return newProgress;
                });
            }, 30); // Faster interval (30ms instead of 50ms)
        }

        // Change loading text faster
        const textInterval = setInterval(() => {
            setCurrentTextIndex(prev => (prev + 1) % loadingTexts.length);
        }, 800); // Reduced from 1500ms to 800ms

        return () => {
            if (interval) clearInterval(interval);
            clearInterval(textInterval);
        };
    }, [isVisible, duration, onComplete, loadingTexts.length]);

    // Handle external visibility changes
    useEffect(() => {
        if (!isVisible) {
            setFadeClass("opacity-0");
        } else {
            setFadeClass("opacity-100");
            setProgress(0);
            setCurrentTextIndex(0);
        }
    }, [isVisible]);

    if (!isVisible && fadeClass === "opacity-0") return null;

    return (
        <div className={`fixed italic inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 transition-opacity duration-300 ${fadeClass}`}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.2) 0%, transparent 50%)`
                }}></div>
            </div>

            {/* Main loader - Faster animations */}
            <div className="relative z-10">
                <div className="relative w-32 h-32">
                    {/* Outer rotating ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-gray-600 opacity-30"></div>
                    <div
                        className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"
                        style={{ animationDuration: '0.8s' }} // Faster spin
                    ></div>

                    {/* Middle ring */}
                    <div
                        className="absolute inset-3 rounded-full border-2 border-transparent border-t-purple-400 animate-spin"
                        style={{ animationDuration: '1s', animationDirection: 'reverse' }} // Faster spin
                    ></div>

                    {/* Inner circle with logo */}
                    <div className="absolute inset-6 rounded-full bg-gradient-to-br from-white to-gray-50 shadow-lg flex items-center justify-center border border-gray-100">
                        <img
                            src={logo}
                            alt="Loader Logo"
                            className="w-12 h-12 object-contain"
                        />
                    </div>

                    {/* Progress dots */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all duration-200 ${duration ? (progress > (i + 1) * 33 ? 'bg-blue-500 scale-125' : 'bg-gray-300') : 'bg-blue-500 animate-pulse'
                                    }`}
                                style={!duration ? { animationDelay: `${i * 0.2}s` } : {}} // Faster animation
                            ></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Loading text */}
            <div className="mt-8 text-center">
                <h3 className="text-xl font-semibold text-white mb-2 animate-pulse" style={{ animationDuration: '1s' }}>
                    {loadingTexts[currentTextIndex]}
                </h3>

                {showProgress && duration && (
                    <div className="flex flex-col items-center space-y-3">
                        {/* Progress bar */}
                        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-150 ease-out" // Faster transition
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>

                        {/* Percentage */}
                        {showPercentage && (
                            <span className="text-sm text-white font-medium">
                                {Math.round(progress)}%
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Floating particles - faster */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20 animate-float"
                        style={{
                            left: `${20 + (i * 15)}%`,
                            top: `${30 + (i * 10)}%`,
                            animationDelay: `${Math.random() * 2}s`, // Reduced delay
                            animationDuration: `${2 + Math.random() * 1}s` // Faster animation
                        }}
                    ></div>
                ))}
            </div>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
          33% { transform: translateY(-15px) rotate(120deg); opacity: 0.4; } // Reduced movement
          66% { transform: translateY(-8px) rotate(240deg); opacity: 0.1; } // Reduced movement
        }
        .animate-float {
          animation: float 3s ease-in-out infinite; // Faster float animation
        }
      `}</style>
        </div>
    );
};
export default Loader;