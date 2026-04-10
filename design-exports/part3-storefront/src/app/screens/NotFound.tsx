import { motion } from "motion/react";
import { useNavigate } from "react-router";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 max-w-sm"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-32 h-32 mx-auto"
        >
          <svg viewBox="0 0 120 120" className="w-full h-full text-[#A8A29E]">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.2"
            />
            <path
              d="M40 70 Q60 85 80 70"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="45" cy="50" r="4" fill="currentColor" />
            <circle cx="75" cy="50" r="4" fill="currentColor" />
            <rect x="30" y="25" width="25" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <rect x="65" y="25" width="25" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <line x1="40" y1="35" x2="48" y2="35" stroke="currentColor" strokeWidth="2" />
            <line x1="72" y1="35" x2="80" y2="35" stroke="currentColor" strokeWidth="2" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h1 className="font-bold text-[20px] text-[#1C1917]">
            Cette boutique n'existe pas ou n'est plus disponible.
          </h1>
          <p className="text-[14px] text-[#78716C]">
            La boutique que vous recherchez est introuvable ou a été fermée.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate("/store/zara-maroc")}
          className="w-full h-12 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1d4ed8] transition-colors"
        >
          Découvrir Plaza
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-6 space-y-2"
        >
          <div className="w-20 h-8 mx-auto">
            <svg viewBox="0 0 80 32" className="w-full h-full">
              <rect x="0" y="0" width="32" height="32" rx="6" fill="#2563EB" />
              <text
                x="16"
                y="22"
                textAnchor="middle"
                fill="white"
                fontSize="18"
                fontWeight="bold"
              >
                P
              </text>
              <text x="40" y="22" fill="#1C1917" fontSize="16" fontWeight="600">
                LAZA
              </text>
            </svg>
          </div>
          <p className="text-[12px] text-[#A8A29E]">La boutique de demain</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
