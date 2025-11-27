import { useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';
import { Heart, Repeat, UserPlus, CheckCircle, RefreshCw } from 'lucide-react';

// -----------------------------------------------------------------
// ⚠️ مقادیر ثابت: این‌ها را با مقادیر واقعی کست و یوزر هدف جایگزین کنید
// -----------------------------------------------------------------
const TARGET_CAST_HASH = "0x4b787590d6...502"; // 👈 هش کست مورد نظر (از Basescan یا Warpcast)
const TARGET_USER_FID = 123456;                 // 👈 FID کاربری که باید فالو شود (مثلاً 3 برای جسی پولار)
const TARGET_CAST_URL = `https://warpcast.com/~/casts/${TARGET_CAST_HASH}`; 
const TARGET_PROFILE_URL = `https://warpcast.com/~/profiles/${TARGET_USER_FID}`; 
// -----------------------------------------------------------------


export default function SocialTasks({ onAllTasksCompleted }: { onAllTasksCompleted: () => void }) {
  const [loading, setLoading] = useState(false);
  
  const [tasks, setTasks] = useState({
    like: false,
    recast: false,
    follow: false
  });

  // FID کاربر لاگین شده (که از طریق Wagmi یا Frame SDK گرفته می‌شود)
  const [userFid, setUserFid] = useState<number | null>(null);

  useEffect(() => {
    // در یک Mini-app فارکستر، بهتر است FID را از Wagmi (اگر لاگین کرده) یا Frame SDK بگیرید.
    // اینجا فرض می‌کنیم FID کاربر را از کانتکست عمومی (مثلاً Frame SDK) می‌گیریم.
    const loadContext = async () => {
      const context = await sdk.context;
      if (context?.user?.fid) {
        setUserFid(context.user.fid);
      }
    };
    loadContext();
  }, []);

  // تابع باز کردن لینک‌ها (Deep Link به وارپ‌کست)
  const openLink = (url: string) => {
    sdk.actions.openUrl(url);
  };

  // -----------------------------------------------------------------
  // 🔑 بخش کلیدی: فراخوانی API Route امن
  // -----------------------------------------------------------------
  const verifyTasks = async () => {
    if (!userFid) {
        alert("FID کاربر یافت نشد. لطفاً از طریق کلاینت فارکستر وارد شوید.");
        return;
    }
    setLoading(true);

    try {
      // فراخوانی API Route لوکال/Vercel (بک‌اند نامرئی ما)
      const response = await fetch(
        `/api/verify?userFid=${userFid}&castHash=${TARGET_CAST_HASH}&targetFid=${TARGET_USER_FID}`
      );
      
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      // آپدیت کردن وضعیت
      setTasks({
        like: data.like,
        recast: data.recast,
        follow: data.follow
      });

      // چک نهایی و فراخوانی کامپوننت مینت
      if (data.like && data.recast && data.follow) {
        onAllTasksCompleted();
      } else {
         alert("تمام مراحل تکمیل نشد. لطفاً مطمئن شوید تمام تسک‌ها را انجام داده‌اید و دوباره بررسی کنید.");
      }

    } catch (error) {
      console.error("Error verifying tasks:", error);
      alert("خطا در بررسی وضعیت تسک‌ها. لطفا مجدداً تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };


  // کامپوننت کمکی برای نمایش هر ردیف تسک
  const TaskRow = ({ 
    title, 
    isCompleted, 
    icon: Icon, 
    actionUrl,
    actionLabel 
  }: any) => (
    <div className={`flex items-center justify-between p-4 mb-3 rounded-xl border transition-all 
        ${isCompleted ? 'bg-green-900/20 border-green-500/50' : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
          {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
        </div>
        <div>
          <h3 className={`font-semibold ${isCompleted ? 'text-green-400' : 'text-gray-200'}`}>{title}</h3>
          <p className="text-xs text-gray-400">{isCompleted ? 'انجام شد' : 'برای تکمیل کلیک کنید'}</p>
        </div>
      </div>
      
      {!isCompleted && (
        <button 
          onClick={() => openLink(actionUrl)}
          className="px-3 py-1.5 text-xs bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto text-white">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold mb-2 text-purple-400">ماموریت‌های ورودی</h2>
        <p className="text-gray-400 text-sm">برای آزادسازی مینت SBT، مراحل زیر را در Warpcast تکمیل کنید.</p>
      </div>

      <div className="space-y-4">
        <TaskRow 
          title="لایک کردن کست هدف" 
          isCompleted={tasks.like} 
          icon={Heart} 
          actionUrl={TARGET_CAST_URL}
          actionLabel="برو به کست"
        />
        
        <TaskRow 
          title="ریکست کردن کست هدف" 
          isCompleted={tasks.recast} 
          icon={Repeat} 
          actionUrl={TARGET_CAST_URL}
          actionLabel="برو به کست"
        />

        <TaskRow 
          title="فالو کردن اکانت" 
          isCompleted={tasks.follow} 
          icon={UserPlus} 
          actionUrl={TARGET_PROFILE_URL}
          actionLabel="مشاهده پروفایل"
        />
      </div>

      {/* دکمه بررسی وضعیت */}
      <div className="mt-8">
        <button
          onClick={verifyTasks}
          disabled={loading || (tasks.like && tasks.recast && tasks.follow)}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300
            ${(tasks.like && tasks.recast && tasks.follow)
              ? 'bg-green-600 text-white cursor-default shadow-lg shadow-green-900/40'
              : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/40 active:scale-98'
            }`}
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin" size={20} /> در حال بررسی...
            </>
          ) : (tasks.like && tasks.recast && tasks.follow) ? (
            <>
              <CheckCircle size={20} /> مینت مجاز است!
            </>
          ) : (
            <>
              بررسی و تأیید تکمیل تسک‌ها
            </>
          )}
        </button>
      </div>
    </div>
  );
}