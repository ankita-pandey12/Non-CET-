import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

const steps = ['Academic Info', 'Course & Exam', 'Review'];

export default function StepIndicator({ current }) {
  const progress = current === 1 ? 0 : current === 2 ? 50 : 100;

  return (
    <div className="stepper">
      <div className="stepper-track">
        <motion.div
          className="stepper-track-fill"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === current;
        const isCompleted = stepNum < current;

        let cls = 'stepper-step';
        if (isActive) cls += ' active';
        if (isCompleted) cls += ' completed';

        return (
          <div className={cls} key={stepNum}>
            <motion.div
              className="stepper-dot"
              animate={isActive ? { scale: 1.08 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {isCompleted ? (
                <FiCheck className="check-icon" size={18} strokeWidth={3} />
              ) : (
                <span className="step-number">{stepNum}</span>
              )}
            </motion.div>
            <span className="stepper-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
