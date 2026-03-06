import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {

  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}

      className="
      relative
      overflow-hidden
      rounded-2xl
      p-6
      md:p-8
      text-white
      flex
      items-center
      justify-between
      "

      style={{
        background: "linear-gradient(135deg,#0F0E47,#272757)",
        boxShadow: "0 20px 60px rgba(134,134,172,0.35)"
      }}
    >

      {/* LEFT TEXT */}
      <div>

        <h1 className="text-2xl md:text-3xl font-bold">
          Welcome back {user?.name?.split(" ")[0]}
        </h1>

        <p className="mt-2 text-white/80">
          Let’s build something great today 🚀
        </p>

      </div>

      {/* FLOATING ICON */}
      <motion.div
        animate={{ y: [0,-10,0] }}
        transition={{
          repeat: Infinity,
          duration: 3
        }}
      >
        <Sparkles size={40}/>
      </motion.div>

      {/* BACKGROUND GLOW */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-30"
        style={{background:"#8686AC"}}
      />

    </motion.div>
  );
};

export default HeroSection;