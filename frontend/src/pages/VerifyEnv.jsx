import React from 'react';

const VerifyEnv = () => {
    return (
        <div className="h-screen w-full bg-black flex items-center justify-center text-white">
            <div className="text-center">
                <h1 className="text-6xl font-black text-emerald-500 mb-4">VERIFICATION SUCCESSFUL</h1>
                <p className="text-2xl">If you see this, I am editing the correct code.</p>
                <div className="mt-8 p-4 border border-emerald-500 rounded">
                    CODE ID: LOCAL_EDIT_123
                </div>
            </div>
        </div>
    );
};

export default VerifyEnv;
