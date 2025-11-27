import React, { useState } from 'react';
import SocialTasks from './SocialTasks'; // مطمئن شوید مسیر درست است
import { useAccount } from 'wagmi'; // برای چک کردن اتصال کیف پول

// کامپوننت جایگزین برای مرحله مینت (در آینده تکمیل می‌شود)
const MintComponent = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-2xl text-black">
        <h2 className="text-3xl font-black mb-3">🎉 آماده مینت!</h2>
        <p className="text-lg font-medium mb-6">شما تمام مراحل را تکمیل کردید. حالا SBT خود را مینت کنید و وارد قرعه‌کشی شوید.</p>
        <button className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition">
            Mint SBT (Coming Soon)
        </button>
    </div>
);

function App() {
  const [canMint, setCanMint] = useState(false);
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
        <div className="p-8 bg-red-900/50 border border-red-700 rounded-xl text-center text-white">
            <h2 className="text-xl font-bold mb-2">اتصال الزامی است!</h2>
            <p>لطفاً برای استفاده از مینی‌اپ، کیف پول خود را به شبکه Base متصل کنید.</p>
            {/* در اینجا باید دکمه Connect Wallet از Wagmi/RainbowKit/etc قرار گیرد */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 font-sans">
      <div className="w-full max-w-lg">
        {!canMint ? (
          // مرحله اول: نمایش تسک‌های سوشال
          <SocialTasks onAllTasksCompleted={() => setCanMint(true)} />
        ) : (
          // مرحله دوم: نمایش کامپوننت مینت
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
             <MintComponent />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;