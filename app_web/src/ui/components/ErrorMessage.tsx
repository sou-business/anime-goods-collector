// src/ui/components/ErrorMessage.tsx
import React from 'react';

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <p className="text-red-600 text-lg mb-4">{message}</p>
                {onRetry && (
                    <button 
                        onClick={onRetry}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        再読み込み
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorMessage;