import { motion, AnimatePresence } from "framer-motion";

export default function ComplaintModal({
  show,
  onClose,
  onSubmit,
  sending,
  done,
  error,
  reason,
  setReason,
  details,
  setDetails,
}) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          
          {/* 🔥 Background Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* 🔥 Modal Box */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 w-full max-w-md bg-[#0b1120] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl"
          >
            {/* ❌ Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-lg"
            >
              ✕
            </button>

            {/* 🧾 Title */}
            <h2 className="text-xl font-semibold text-white mb-4">
              File Complaint
            </h2>

            {/* ✅ Success Message */}
            {done ? (
              <p className="text-green-400 text-center">
                Complaint submitted successfully!
              </p>
            ) : (
              <>
                {/* 📌 Reason Input */}
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason"
                  className="w-full mb-3 p-2 rounded bg-gray-800 text-white outline-none"
                />

                {/* 📌 Details Input */}
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Details..."
                  className="w-full mb-4 p-2 rounded bg-gray-800 text-white outline-none"
                  rows={4}
                />

                {/* ❗ Error Message */}
                {error && (
                  <p className="text-red-400 text-sm mb-2">{error}</p>
                )}

                {/* 🚀 Submit Button */}
                <button
                  onClick={onSubmit}
                  disabled={sending}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-2 rounded transition"
                >
                  {sending ? "Submitting..." : "Submit"}
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}