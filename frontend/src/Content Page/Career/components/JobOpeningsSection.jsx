import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Job Card Component
const JobCard = ({ job, index }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const navigate = useNavigate();

  const handleApplyClick = () => {
    navigate(`/jobs/${job.id}`);
  };

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Glowing border effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-75 blur-xl transition duration-500" />

      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-xl overflow-hidden h-full flex flex-col">
        {/* Animated background pattern */}
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, cyan 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
          animate={isHovered ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.5 }}
        />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-2xl" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-purple-400/50 rounded-br-2xl" />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              {job.title}
            </h3>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-lg"
            >
              💼
            </motion.div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 text-cyan-300"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <span className="text-purple-400">📍</span> {job.location}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-cyan-400">⏱️</span> {job.experience}
            </span>
          </div>

          <p className="text-gray-300 text-sm mb-6 flex-grow leading-relaxed">
            {job.description}
          </p>

          <motion.button
            onClick={handleApplyClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group/btn overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-100 group-hover/btn:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 opacity-0 group-hover/btn:opacity-100 blur-xl transition-opacity duration-300" />
            <span className="relative z-10 block px-6 py-3 text-white font-bold text-center rounded-xl border-2 border-transparent group-hover/btn:border-white/50">
              APPLY NOW →
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const JobOpeningsSection = () => {
  const jobs = [
    {
      id: 'fullstack-developer',
      title: 'Fullstack Developer',
      tags: ['Full time', 'Office', 'Remote'],
      experience: '2 Years+',
      location: 'Tirunelveli, Kalakad',
      description: 'Strong problem-solving skills and understanding of backend technologies (e.g., Node.js, Express). Build the future of web applications.'
    },
    {
      id: 'technical-trainer',
      title: 'Technical Trainer',
      tags: ['Full time', 'Office'],
      experience: '0-1 Year',
      location: 'Tirunelveli, Kalakad',
      description: 'Strong verbal and written communication for delivering content and interacting with trainees. Shape the next generation of tech talent.'
    },
    {
      id: 'network-engineer',
      title: 'Network Engineer',
      tags: ['Full time', 'Office'],
      experience: '0-1 Year',
      location: 'Tirunelveli, Kalakad',
      description: 'Installing Network Hardware, Set up routers, switches, firewalls, and other network devices. Build infrastructure that powers innovation.'
    },
    {
      id: 'business-development-executive',
      title: 'Business Development Executive',
      tags: ['Full time', 'Office', 'Hybrid'],
      experience: '2 Years+',
      location: 'Tirunelveli, Kalakad',
      description: 'Research and analyze market trends, competitors, and industry developments. Drive growth and forge strategic partnerships.'
    },
    {
      id: 'python-developer',
      title: 'Python Developer',
      tags: ['Full time', 'Remote'],
      experience: '2 Years+',
      location: 'Tirunelveli, Kalakad',
      description: 'Proficiency in Python and frameworks like Django or Flask. Create powerful backend solutions that scale.'
    },
    {
      id: 'ai-engineer',
      title: 'AI/ML Engineer',
      tags: ['Full time', 'Office', 'Remote'],
      experience: '3 Years+',
      location: 'Tirunelveli, Kalakad',
      description: 'Build intelligent systems using cutting-edge AI/ML technologies. Shape the future with artificial intelligence.'
    }
  ];

  return (
    <>
      {jobs.map((job, index) => (
        <JobCard key={job.id} job={job} index={index} />
      ))}
    </>
  );
};

export default JobOpeningsSection;
