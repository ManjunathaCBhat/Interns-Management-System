import { motion } from "framer-motion";
import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar
} from "lucide-react";

const cards = [
  {
    title: "Active Tasks",
    value: 8,
    icon: CheckCircle,
    route: "/daily-updates"
  },
  {
    title: "In Progress",
    value: 3,
    icon: Clock,
    route: "/daily-updates"
  },
  {
    title: "Completed",
    value: 15,
    icon: TrendingUp,
    route: "/daily-updates"
  },
  {
    title: "DSU Streak",
    value: 6,
    icon: Calendar,
    route: "/dashboard/profile"
  }
];

const Counter = ({ value }: { value: number }) => {

  const [count, setCount] = useState(0);

  useEffect(() => {

    let start = 0;
    const duration = 800;
    const increment = value / (duration / 16);

    const timer = setInterval(() => {

      start += increment;

      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }

    }, 16);

    return () => clearInterval(timer);

  }, [value]);

  return <span>{count}</span>;
};

const KpiCards = () => {
  const navigate = useNavigate();
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

      {cards.map((card,index)=>{

        const Icon = card.icon;

        return(

          <motion.div
            key={index}
            onClick={() => navigate(card.route)}
            whileHover={{scale:1.05}}
            whileTap={{scale:0.95}}

            className="cursor-pointer rounded-xl p-5 bg-white transition duration-300 card-depth card-depth-hover kpi-glow"

            style={{
              border:"1px solid rgba(134,134,172,0.25)",
              boxShadow:"0 5px 20px rgba(0,0,0,0.05)"
            }}
          >

            <div className="flex justify-between items-center">

              <h3 className="text-sm text-gray-500">
                {card.title}
              </h3>

              <Icon size={18} color="#505081" />

            </div>

            <p className="text-3xl font-bold mt-3">
              <Counter value={card.value} />
            </p>

          </motion.div>

        )

      })}

    </div>
  )

}

export default KpiCards;